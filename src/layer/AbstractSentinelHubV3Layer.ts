import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';
import WKT from 'terraformer-wkt-parser';

import { getAuthToken } from '../auth';
import { BBox } from '../bbox';
import {
  GetMapParams,
  ApiType,
  PaginatedTiles,
  HistogramType,
  FisPayload,
  MosaickingOrder,
  GetStatsParams,
  Stats,
  Interpolator,
  Link,
  DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER,
  SUPPORTED_DATA_PRODUCTS_PROCESSING,
  DataProductId,
} from './const';
import { wmsGetMapUrl } from './wms';
import { processingGetMap, createProcessingPayload, ProcessingPayload } from './processing';
import { AbstractLayer } from './AbstractLayer';
import { CRS_EPSG4326, findCrsFromUrn } from '../crs';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';

import { Effects } from '../mapDataManipulation/const';
import { runEffectFunctions } from '../mapDataManipulation/runEffectFunctions';
import { CACHE_CONFIG_30MIN, CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
  upsampling?: Interpolator | null;
  downsampling?: Interpolator | null;
  legendUrl?: string | null;
}

// this class provides any SHv3-specific functionality to the subclasses:
export class AbstractSentinelHubV3Layer extends AbstractLayer {
  protected instanceId: string | null;
  protected layerId: string | null;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;
  protected dataProduct: DataProductId | null;
  public legend?: any[] | null;
  protected evalscriptWasConvertedToV3: boolean | null;
  public mosaickingOrder: MosaickingOrder | null; // public because ProcessingDataFusionLayer needs to read it directly
  public upsampling: Interpolator | null;
  public downsampling: Interpolator | null;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    mosaickingOrder = null,
    title = null,
    description = null,
    upsampling = null,
    downsampling = null,
    legendUrl = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    if (
      (layerId === null || instanceId === null) &&
      evalscript === null &&
      evalscriptUrl === null &&
      dataProduct === null
    ) {
      throw new Error(
        'At least one of these parameters (instanceId + layerId, evalscript, evalscriptUrl, dataProduct) must be specified!',
      );
    }
    this.instanceId = instanceId;
    this.layerId = layerId;
    this.evalscript = evalscript;
    this.evalscriptUrl = evalscriptUrl;
    this.dataProduct = dataProduct;
    this.evalscriptWasConvertedToV3 = false;
    this.mosaickingOrder = mosaickingOrder;
    this.upsampling = upsampling;
    this.downsampling = downsampling;
  }

  protected async fetchLayerParamsFromSHServiceV3(reqConfig: RequestConfiguration): Promise<any> {
    if (this.instanceId === null || this.layerId === null) {
      throw new Error('Could not fetch layer params - instanceId and layerId must be set on Layer');
    }
    if (!this.dataset) {
      throw new Error('This layer does not support Processing API (unknown dataset)');
    }
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to fetch layer params');
    }
    // Note that for SH v3 service, the endpoint for fetching the list of layers is always
    // https://services.sentinel-hub.com/, even for creodias datasets:
    const url = `https://services.sentinel-hub.com/configuration/v1/wms/instances/${this.instanceId}/layers`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    const requestConfig: AxiosRequestConfig = {
      responseType: 'json',
      headers: headers,
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
    };
    const res = await axios.get(url, requestConfig);
    const layersParams = res.data.map((l: any) => ({
      layerId: l.id,
      ...l.datasourceDefaults,
      evalscript: l.styles[0].evalScript,
      dataProduct: l.styles[0].dataProduct ? l.styles[0].dataProduct['@id'] : undefined,
      legend: l.styles.find((s: any) => s.name === l.defaultStyleName)
        ? l.styles.find((s: any) => s.name === l.defaultStyleName).legend
        : null,
    }));

    const layerParams = layersParams.find((l: any) => l.layerId === this.layerId);
    if (!layerParams) {
      throw new Error('Layer params could not be found');
    }
    return layerParams;
  }

  protected async updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ProcessingPayload> {
    // Subclasses should override this method if they wish to supply additional
    // parameters to Processing API.
    // Typically, if additional layer data is needed for that, this code will be called:
    //   const layerParams = await this.fetchLayerParamsFromSHServiceV3();
    return payload;
  }

  protected getShServiceHostname(): string {
    return this.dataset.shServiceHostname;
  }

  protected async fetchEvalscriptUrlIfNeeded(reqConfig: RequestConfiguration): Promise<void> {
    if (this.evalscriptUrl && !this.evalscript) {
      const response = await axios.get(this.evalscriptUrl, {
        responseType: 'text',
        ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
      });
      this.evalscript = response.data;
    }
  }

  protected async convertEvalscriptToV3IfNeeded(reqConfig: RequestConfiguration): Promise<void> {
    // Convert internal evalscript to V3 if it's not in that version.
    if (this.evalscriptWasConvertedToV3 || !this.evalscript) {
      return;
    }
    if (!this.evalscript.startsWith('//VERSION=3')) {
      const evalscript = await this.convertEvalscriptToV3(this.evalscript, reqConfig);
      this.evalscript = evalscript;
    }
    this.evalscriptWasConvertedToV3 = true;
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    const getMapValue = await ensureTimeout(async innerReqConfig => {
      // SHv3 services support Processing API:
      if (api === ApiType.PROCESSING) {
        if (!this.dataset) {
          throw new Error('This layer does not support Processing API (unknown dataset)');
        }

        await this.fetchEvalscriptUrlIfNeeded(innerReqConfig);

        let layerParams = null;
        if (!this.evalscript && !this.dataProduct) {
          layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
          if (layerParams.evalscript) {
            this.evalscript = layerParams.evalscript;
          } else if (layerParams.dataProduct) {
            this.dataProduct = layerParams.dataProduct;
          } else {
            throw new Error(
              `Could not fetch evalscript / dataProduct from service for layer ${this.layerId}`,
            );
          }
        }
        if (
          this.instanceId &&
          this.layerId &&
          (!this.mosaickingOrder || !this.upsampling || !this.downsampling)
        ) {
          if (!layerParams) {
            layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
          }
          if (!this.mosaickingOrder && layerParams && layerParams.mosaickingOrder) {
            this.mosaickingOrder = layerParams.mosaickingOrder;
          }
          if (!this.upsampling && layerParams && layerParams.upsampling) {
            this.upsampling = layerParams.upsampling;
          }
          if (!this.downsampling && layerParams && layerParams.downsampling) {
            this.downsampling = layerParams.downsampling;
          }
        }

        await this.convertEvalscriptToV3IfNeeded(innerReqConfig);

        const payload = createProcessingPayload(
          this.dataset,
          params,
          this.evalscript,
          this.dataProduct,
          this.mosaickingOrder,
          this.upsampling,
          this.downsampling,
        );
        // allow subclasses to update payload with their own parameters:
        const updatedPayload = await this.updateProcessingGetMapPayload(payload, innerReqConfig);
        const shServiceHostname = this.getShServiceHostname();

        let blob = await processingGetMap(shServiceHostname, updatedPayload, innerReqConfig);

        // apply effects:
        // support deprecated GetMapParams.gain and .gamma parameters
        // but override them if they are also present in .effects
        const effects: Effects = { gain: params.gain, gamma: params.gamma, ...params.effects };
        blob = await runEffectFunctions(blob, effects);

        return blob;
      }

      return super.getMap(params, api, innerReqConfig);
    }, reqConfig);
    return getMapValue;
  }

  public supportsApiType(api: ApiType): boolean {
    if (this.dataProduct && !SUPPORTED_DATA_PRODUCTS_PROCESSING.includes(this.dataProduct)) {
      return api === ApiType.WMS;
    }
    return api === ApiType.WMS || (api === ApiType.PROCESSING && !!this.dataset);
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    let additionalParameters: Record<string, any> = {};

    if (this.mosaickingOrder) {
      additionalParameters.priority = this.mosaickingOrder;
    }
    if (this.upsampling) {
      additionalParameters.upsampling = this.upsampling;
    }
    if (this.downsampling) {
      additionalParameters.downsampling = this.downsampling;
    }
    return additionalParameters;
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('This API type does not support GET HTTP method!');
    }
    if (!this.dataset) {
      throw new Error('This layer does not have a dataset specified');
    }
    if (params.gain) {
      throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.gamma) {
      throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.effects) {
      throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
    }
    const shServiceHostname = this.getShServiceHostname();
    const baseUrl = `${shServiceHostname}ogc/wms/${this.instanceId}`;
    const evalsource = this.dataset.shWmsEvalsource;
    return wmsGetMapUrl(
      baseUrl,
      this.layerId,
      params,
      this.evalscript,
      this.evalscriptUrl,
      evalsource,
      this.getWmsGetMapUrlAdditionalParameters(),
    );
  }

  public setEvalscript(evalscript: string): void {
    this.evalscript = evalscript;
  }

  public setEvalscriptUrl(evalscriptUrl: string): void {
    this.evalscriptUrl = evalscriptUrl;
  }

  protected createSearchIndexRequestConfig(reqConfig: RequestConfiguration): AxiosRequestConfig {
    const requestConfig: AxiosRequestConfig = {
      headers: { 'Accept-CRS': 'EPSG:4326' },
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE),
    };
    return requestConfig;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: this.extractFindTilesMeta(tile),
        links: this.getTileLinks(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    return [];
  }

  protected convertResponseFromCatalog(response: any): PaginatedTiles {
    return {
      tiles: response.data.features.map((feature: Record<string, any>) => ({
        geometry: feature.geometry,
        sensingTime: moment.utc(feature.properties.datetime).toDate(),
        meta: this.extractFindTilesMetaFromCatalog(feature),
        links: this.getTileLinksFromCatalog(feature),
      })),
      hasMore: !!response.data.context.next,
    };
  }

  protected async fetchTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTilesFromSearchIndexOrCatalog(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      reqConfig,
    );
    return response;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    const fetchTilesResponse = await ensureTimeout(
      async innerReqConfig => await this.fetchTiles(bbox, fromTime, toTime, maxCount, offset, innerReqConfig),
      reqConfig,
    );
    return fetchTilesResponse;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [];
  }

  protected async fetchTilesFromSearchIndexOrCatalog(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig: RequestConfiguration,
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Promise<PaginatedTiles> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    const canUseCatalog = authToken && !!this.dataset.catalogCollection;
    if (canUseCatalog) {
      return this.fetchTilesCatalog(
        authToken,
        bbox,
        fromTime,
        toTime,
        maxCount,
        offset,
        reqConfig,
        maxCloudCoverPercent,
        datasetParameters,
      );
    } else {
      return this.fetchTilesSearchIndex(
        this.dataset.searchIndexUrl,
        bbox,
        fromTime,
        toTime,
        maxCount,
        offset,
        reqConfig,
        maxCloudCoverPercent,
        datasetParameters,
      );
    }
  }

  protected async fetchTilesSearchIndex(
    searchIndexUrl: string,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig: RequestConfiguration,
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Promise<PaginatedTiles> {
    if (maxCount === null) {
      maxCount = DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER;
    }
    if (offset === null) {
      offset = 0;
    }
    if (!searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    const bboxPolygon = bbox.toGeoJSON();
    // Note: we are requesting maxCloudCoverage as a number between 0 and 1, but in
    // the tiles we get cloudCoverPercentage (0..100).
    const payload: any = {
      clipping: bboxPolygon,
      maxcount: maxCount,
      maxCloudCoverage: maxCloudCoverPercent !== null ? maxCloudCoverPercent / 100 : null,
      timeFrom: fromTime.toISOString(),
      timeTo: toTime.toISOString(),
      offset: offset,
    };

    if (datasetParameters) {
      payload.datasetParameters = datasetParameters;
    }

    const response = await axios.post(
      searchIndexUrl,
      payload,
      this.createSearchIndexRequestConfig(reqConfig),
    );
    return this.convertResponseFromSearchIndex(response);
  }
  protected async fetchTilesCatalog(
    authToken: string,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig: RequestConfiguration,
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    if (!authToken) {
      throw new Error('Must be authenticated to use Catalog service');
    }

    if (!this.dataset.catalogCollection) {
      throw new Error('Cannot use Catalog service without collection');
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
    const requestConfig: AxiosRequestConfig = {
      headers: headers,
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
    };

    const payload: any = {
      bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
      datetime: `${moment.utc(fromTime).toISOString()}/${moment.utc(toTime).toISOString()}`,
      collections: [this.dataset.catalogCollection],
      limit: maxCount,
    };
    if (offset > 0) {
      payload.next = offset;
    }

    let payloadQuery: any;
    if (maxCloudCoverPercent !== undefined && maxCloudCoverPercent !== null) {
      payloadQuery = {
        ...payloadQuery,
        'eo:cloud_cover': {
          lte: maxCloudCoverPercent,
        },
      };
    }

    if (datasetParameters && datasetParameters.acquisitionMode) {
      payloadQuery = {
        ...payloadQuery,
        'sar:instrument_mode': {
          eq: datasetParameters.acquisitionMode,
        },
      };
    }

    if (datasetParameters && datasetParameters.polarization) {
      payloadQuery = {
        ...payloadQuery,
        polarization: {
          eq: datasetParameters.polarization,
        },
      };
    }

    if (datasetParameters && datasetParameters.resolution) {
      payloadQuery = {
        ...payloadQuery,
        resolution: {
          eq: datasetParameters.resolution,
        },
      };
    }

    if (datasetParameters && datasetParameters.orbitDirection) {
      payloadQuery = {
        ...payloadQuery,
        'sat:orbit_state': {
          eq: datasetParameters.orbitDirection,
        },
      };
    }

    if (payloadQuery) {
      payload.query = payloadQuery;
    }

    const response = await axios.post(
      `${this.dataset.shServiceHostname}api/v1/catalog/search`,
      payload,
      requestConfig,
    );

    return this.convertResponseFromCatalog(response);
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    return {};
  }

  protected getStatsAdditionalParameters(): Record<string, any> {
    return {};
  }

  protected async getFindDatesUTCUrl(
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    return this.dataset.findDatesUTCUrl;
  }

  public async findDatesUTC(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    reqConfig?: RequestConfiguration,
  ): Promise<Date[]> {
    const findDatesUTCValue = await ensureTimeout(async innerReqConfig => {
      const findDatesUTCUrl = await this.getFindDatesUTCUrl(innerReqConfig);
      if (!findDatesUTCUrl) {
        throw new Error('This dataset does not support searching for dates');
      }

      const bboxPolygon = bbox.toGeoJSON();
      const payload: any = {
        queryArea: bboxPolygon,
        from: fromTime.toISOString(),
        to: toTime.toISOString(),
        ...(await this.getFindDatesUTCAdditionalParameters(innerReqConfig)),
      };

      const axiosReqConfig: AxiosRequestConfig = {
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
      };
      const response = await axios.post(findDatesUTCUrl, payload, axiosReqConfig);
      const found: Moment[] = response.data.map((date: string) => moment.utc(date));

      // S-5P, S-3 and possibly other datasets return the results in reverse order (leastRecent).
      // Let's sort the data so that we always return most recent results first:
      found.sort((a, b) => b.unix() - a.unix());
      return found.map(m => m.toDate());
    }, reqConfig);
    return findDatesUTCValue;
  }

  public async getStats(params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats> {
    const stats = await ensureTimeout(async innerReqConfig => {
      if (!params.geometry) {
        throw new Error('Parameter "geometry" needs to be provided');
      }
      if (!params.resolution) {
        throw new Error('Parameter "resolution" needs to be provided');
      }
      if (!params.fromTime || !params.toTime) {
        throw new Error('Parameters "fromTime" and "toTime" need to be provided');
      }

      const payload: FisPayload = {
        layer: this.layerId,
        crs: CRS_EPSG4326.authId,
        geometry: WKT.convert(params.geometry),
        time: `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${moment
          .utc(params.toTime)
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z'}`,
        resolution: undefined,
        bins: params.bins || 5,
        type: HistogramType.EQUALFREQUENCY,
        ...this.getStatsAdditionalParameters(),
      };

      if (params.geometry.crs) {
        const selectedCrs = findCrsFromUrn(params.geometry.crs.properties.name);
        payload.crs = selectedCrs.authId;
      }
      // When using CRS=EPSG:4326 one has to add the "m" suffix to enforce resolution in meters per pixel
      if (payload.crs === CRS_EPSG4326.authId) {
        payload.resolution = params.resolution + 'm';
      } else {
        payload.resolution = params.resolution;
      }
      if (this.evalscript) {
        if (typeof window !== 'undefined' && window.btoa) {
          payload.evalscript = btoa(this.evalscript);
        } else {
          payload.evalscript = Buffer.from(this.evalscript, 'utf8').toString('base64');
        }
      }

      const axiosReqConfig: AxiosRequestConfig = {
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE),
      };

      const shServiceHostname = this.getShServiceHostname();
      const { data } = await axios.post(
        shServiceHostname + 'ogc/fis/' + this.instanceId,
        payload,
        axiosReqConfig,
      );
      // convert date strings to Date objects
      for (let channel in data) {
        data[channel] = data[channel].map((dailyStats: any) => ({
          ...dailyStats,
          date: new Date(dailyStats.date),
        }));
      }
      return data;
    }, reqConfig);
    return stats;
  }

  protected async convertEvalscriptToV3(
    evalscript: string,
    reqConfig: RequestConfiguration,
  ): Promise<string> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to convert evalscript to V3');
    }
    const url = this.getConvertEvalscriptBaseUrl();
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/ecmascript',
      },
      responseType: 'text',
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
    };
    const res = await axios.post(url, evalscript, requestConfig);
    return res.data;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
      this.legend = layerParams['legend'] ? layerParams['legend'] : null;
      // this is a hotfix for `supportsApiType()` not having enough information - should be fixed properly later:
      this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
    }, reqConfig);
  }

  protected getConvertEvalscriptBaseUrl(): string {
    const shServiceHostname = this.getShServiceHostname();
    return `${shServiceHostname}api/v1/process/convertscript?datasetType=${this.dataset.shProcessingApiDatasourceAbbreviation}`;
  }
}
