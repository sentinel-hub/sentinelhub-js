import { Geometry } from '@turf/helpers';
import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';

import { getAuthToken } from '../auth';
import { BBox } from '../bbox';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { AbstractLayer } from './AbstractLayer';
import {
  ApiType,
  CATALOG_SEARCH_MAX_LIMIT,
  DataProductId,
  DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER,
  FindTilesAdditionalParameters,
  GetMapParams,
  GetStatsParams,
  Interpolator,
  Link,
  LinkType,
  MosaickingOrder,
  PaginatedTiles,
  Stats,
  SUPPORTED_DATA_PRODUCTS_PROCESSING,
  Highlight,
} from './const';
import { createProcessingPayload, processingGetMap, ProcessingPayload } from './processing';
import { wmsGetMapUrl } from './wms';

import { Effects } from '../mapDataManipulation/const';
import { runEffectFunctions } from '../mapDataManipulation/runEffectFunctions';
import { StatisticsProviderType } from '../statistics/const';
import { Fis } from '../statistics/Fis';
import { StatisticalApi } from '../statistics/StatisticalApi';
import { CACHE_CONFIG_30MIN, CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';
import { fetchDataProduct, fetchLayerParamsFromConfigurationService, getSHServiceRootUrl } from './utils';

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
  highlights?: Highlight[] | null;
}

// this class provides any SHv3-specific functionality to the subclasses:
export class AbstractSentinelHubV3Layer extends AbstractLayer {
  protected instanceId: string | null;
  protected layerId: string | null;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;
  protected dataProduct: DataProductId | null;
  public legend?: any[] | null;
  public mosaickingOrder: MosaickingOrder | null; // public because ProcessingDataFusionLayer needs to read it directly
  public upsampling: Interpolator | null;
  public downsampling: Interpolator | null;
  public highlights?: Highlight[] | null;

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
    highlights = null,
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
    this.mosaickingOrder = mosaickingOrder;
    this.upsampling = upsampling;
    this.downsampling = downsampling;
    this.highlights = highlights;
  }

  public getLayerId(): string {
    return this.layerId;
  }

  public getEvalscript(): string {
    return this.evalscript;
  }

  public getDataProduct(): string {
    return this.dataProduct;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }

  protected async fetchLayerParamsFromSHServiceV3(reqConfig: RequestConfiguration): Promise<any> {
    if (this.instanceId === null || this.layerId === null) {
      throw new Error('Could not fetch layer params - instanceId and layerId must be set on Layer');
    }
    if (!this.dataset) {
      throw new Error('This layer does not support Processing API (unknown dataset)');
    }
    const layersParams = await fetchLayerParamsFromConfigurationService({
      shServiceHostName: this.getSHServiceRootUrl(),
      instanceId: this.instanceId,
      reqConfig,
    });

    const layerParams = layersParams.find((l: any) => l.layerId === this.layerId);
    if (!layerParams) {
      throw new Error('Layer params could not be found');
    }

    if (
      !layerParams['evalscript'] &&
      layerParams['dataProduct'] &&
      !SUPPORTED_DATA_PRODUCTS_PROCESSING.includes(layerParams['dataProduct'])
    ) {
      const response = await fetchDataProduct(layerParams['dataProduct'], reqConfig);
      const evalScript = response?.data?.evalScript;
      if (evalScript) {
        layerParams['evalscript'] = evalScript;
      }
    }

    return layerParams;
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
    params?: GetMapParams, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ProcessingPayload> {
    // Subclasses should override this method if they wish to supply additional
    // parameters to Processing API.
    // Typically, if additional layer data is needed for that, this code will be called:
    //   const layerParams = await this.fetchLayerParamsFromSHServiceV3();
    return payload;
  }

  public getShServiceHostname(): string {
    return this.dataset.shServiceHostname;
  }

  protected getCatalogCollectionId(): string {
    return this.dataset.catalogCollectionId;
  }

  protected getSearchIndexUrl(): string {
    return this.dataset.searchIndexUrl;
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

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    return await ensureTimeout(async (innerReqConfig) => {
      params = await this.decideJpegOrPng(params, innerReqConfig);
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

        const payload = createProcessingPayload(
          this.dataset,
          params,
          params.evalscriptId ?? this.evalscript,
          this.dataProduct,
          this.mosaickingOrder,
          this.upsampling,
          this.downsampling,
        );
        // allow subclasses to update payload with their own parameters:
        const updatedPayload = await this._updateProcessingGetMapPayload(payload, 0, innerReqConfig, params);
        const shServiceHostname = this.getShServiceHostname();
        let blob = await processingGetMap(
          shServiceHostname,
          updatedPayload,
          innerReqConfig,
          Boolean(params.evalscriptId),
        );

        // apply effects:
        // support deprecated GetMapParams.gain and .gamma parameters
        // but override them if they are also present in .effects
        const effects: Effects = { gain: params.gain, gamma: params.gamma, ...params.effects };
        blob = await runEffectFunctions(blob, effects);

        return blob;
      }

      return super.getMap(params, api, innerReqConfig);
    }, reqConfig);
  }

  public supportsApiType(api: ApiType): boolean {
    if (this.dataProduct && SUPPORTED_DATA_PRODUCTS_PROCESSING.includes(this.dataProduct)) {
      return api === ApiType.PROCESSING;
    }
    return api === ApiType.WMS || (api === ApiType.PROCESSING && !!this.dataset && !!this.evalscript);
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
      tiles: response.data.tiles.map((tile) => ({
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
    const { assets, links } = feature;
    let result: Link[] = [];
    if (!assets && !links) {
      return [];
    }

    if (assets && assets.data) {
      result.push({ target: assets.data.href, type: LinkType.AWS });
    }

    if (assets && assets.thumbnail) {
      result.push({ target: assets.thumbnail.href, type: LinkType.PREVIEW });
    }

    const sciHubLink = links.find((l: Record<string, any>) => {
      return l.title === 'scihub download';
    });

    if (sciHubLink) {
      result.push({ target: sciHubLink.href, type: LinkType.SCIHUB });
    }

    return result;
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

  protected async findTilesInner(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
    intersects?: Geometry,
  ): Promise<PaginatedTiles> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    const canUseCatalog = authToken && !!this.getCatalogCollectionId();
    let result: PaginatedTiles = null;

    if (canUseCatalog) {
      const response: Record<string, any> = await this.findTilesUsingCatalog(
        authToken,
        bbox,
        fromTime,
        toTime,
        maxCount,
        offset,
        reqConfig,
        this.getFindTilesAdditionalParameters(),
        intersects,
      );
      result = this.convertResponseFromCatalog(response);
    } else {
      throw new Error('Please authenticate and provide collection id.');
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [];
  }

  protected createCatalogFilterQuery(
    maxCloudCoverPercent?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    datasetParameters?: Record<string, any> | null, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Record<string, any> {
    return null;
  }

  protected async findTilesUsingCatalog(
    authToken: string,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig: RequestConfiguration,
    findTilesAdditionalParameters: FindTilesAdditionalParameters,
    intersects?: null | Geometry,
  ): Promise<Record<string, any>> {
    if (maxCount !== null && maxCount > CATALOG_SEARCH_MAX_LIMIT) {
      throw new Error(`Parameter maxCount must be less than or equal to ${CATALOG_SEARCH_MAX_LIMIT}`);
    }

    if (!authToken) {
      throw new Error('Must be authenticated to use Catalog service');
    }

    const catalogCollectionId = this.getCatalogCollectionId();
    if (!catalogCollectionId) {
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

    const { maxCloudCoverPercent, datasetParameters, distinct } = findTilesAdditionalParameters;

    const payload: any = {
      bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
      datetime: `${moment.utc(fromTime).toISOString()}/${moment.utc(toTime).toISOString()}`,
      collections: [catalogCollectionId],
    };

    if (maxCount > 0) {
      payload.limit = maxCount;
    }

    if (offset > 0) {
      payload.next = offset;
    }

    if (intersects) {
      payload.intersects = intersects;
      payload.bbox = null;
    }

    const filterQuery = this.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters);
    if (filterQuery) {
      payload.filter = filterQuery;
      payload['filter-lang'] = 'cql2-json';
    }

    if (distinct) {
      payload['distinct'] = distinct;
    }
    const shServiceHostname = this.getShServiceHostname();

    return await axios.post(`${shServiceHostname}api/v1/catalog/1.0.0/search`, payload, requestConfig);
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    return {};
  }

  public getStatsAdditionalParameters(): Record<string, any> {
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
    const findDatesUTCValue = await ensureTimeout(async (innerReqConfig) => {
      const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
      const canUseCatalog = authToken && !!this.getCatalogCollectionId();
      if (canUseCatalog) {
        return await this.findDatesUTCCatalog(innerReqConfig, authToken, bbox, fromTime, toTime);
      } else {
        return await this.findDatesUTCSearchIndex(innerReqConfig, bbox, fromTime, toTime);
      }
    }, reqConfig);
    return findDatesUTCValue;
  }

  private async findDatesUTCSearchIndex(
    innerReqConfig: RequestConfiguration,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
  ): Promise<Date[]> {
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
    return found.map((m) => m.toDate());
  }

  protected async findDatesUTCCatalog(
    innerReqConfig: RequestConfiguration,
    authToken: string,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
  ): Promise<Date[]> {
    const { maxCloudCoverage, datasetParameters } = await this.getFindDatesUTCAdditionalParameters();
    let findTilesAdditionalParameters: Record<string, any> = { datasetParameters: datasetParameters };
    if (maxCloudCoverage !== null && maxCloudCoverage !== undefined) {
      findTilesAdditionalParameters.maxCloudCoverPercent = maxCloudCoverage * 100;
    }
    findTilesAdditionalParameters.distinct = 'date';

    let results: Date[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.findTilesUsingCatalog(
        authToken,
        bbox,
        fromTime,
        toTime,
        CATALOG_SEARCH_MAX_LIMIT,
        offset,
        innerReqConfig,
        findTilesAdditionalParameters,
      );

      if (response && response.data && response.data.features) {
        results = [...results, ...response.data.features.map((date: string) => new Date(date))];
      }

      if (response && response.data && response.data.context && !!response.data.context.next) {
        hasMore = !!response.data.context.next;
        offset = response.data.context.next;
      } else {
        hasMore = false;
      }
    }

    return results.sort((a: Date, b: Date) => b.getTime() - a.getTime());
  }

  public async getStats(
    params: GetStatsParams,
    reqConfig: RequestConfiguration = {},
    statsProvider: StatisticsProviderType = StatisticsProviderType.FIS,
  ): Promise<Stats> {
    const stats = await ensureTimeout(async (innerReqConfig) => {
      let data: Stats;
      if (statsProvider === StatisticsProviderType.FIS) {
        data = await new Fis().handleV3(this, params, innerReqConfig);
      } else if (statsProvider === StatisticsProviderType.STAPI) {
        data = await new StatisticalApi().getStats(this, params, innerReqConfig);
      } else {
        throw new Error(`Unssuported statistics provider ${statsProvider}`);
      }
      return data;
    }, reqConfig);

    return stats;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async (innerReqConfig) => {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
      this.legend = layerParams['legend'] ? layerParams['legend'] : null;

      if (!this.evalscript) {
        this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
      }
      if (!this.mosaickingOrder && layerParams.mosaickingOrder) {
        this.mosaickingOrder = layerParams.mosaickingOrder;
      }
      if (!this.upsampling && layerParams.upsampling) {
        this.upsampling = layerParams.upsampling;
      }
      if (!this.downsampling && layerParams.downsampling) {
        this.downsampling = layerParams.downsampling;
      }

      this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
    }, reqConfig);
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    return {
      maxCloudCoverPercent: null,
      datasetParameters: null,
    };
  }

  public getSHServiceRootUrl(): string {
    return getSHServiceRootUrl(this.dataset.shServiceHostname);
  }
}
