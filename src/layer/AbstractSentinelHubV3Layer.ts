import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';
import WKT from 'terraformer-wkt-parser';

import { getAuthToken, isAuthTokenSet } from 'src/auth';
import { BBox } from 'src/bbox';
import {
  GetMapParams,
  ApiType,
  PaginatedTiles,
  HistogramType,
  FisPayload,
  MosaickingOrder,
  GetStatsParams,
  Stats,
  Link,
} from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { processingGetMap, createProcessingPayload, ProcessingPayload } from 'src/layer/processing';
import { AbstractLayer } from 'src/layer/AbstractLayer';
import { CRS_EPSG4326, findCrsFromUrn } from 'src/crs';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
}

// this class provides any SHv3-specific functionality to the subclasses:
export class AbstractSentinelHubV3Layer extends AbstractLayer {
  protected instanceId: string | null;
  protected layerId: string | null;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;
  protected dataProduct: string | null;
  protected evalscriptWasConvertedToV3: boolean | null;
  public mosaickingOrder: MosaickingOrder | null; // public because ProcessingDataFusionLayer needs to read it directly

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    mosaickingOrder = null,
    title = null,
    description = null,
  }: ConstructorParameters) {
    super({ title, description });
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
  }

  protected async fetchLayerParamsFromSHServiceV3(): Promise<any> {
    if (this.instanceId === null || this.layerId === null) {
      throw new Error('Could not fetch layer params - instanceId and layerId must be set on Layer');
    }
    if (!this.dataset) {
      throw new Error('This layer does not support Processing API (unknown dataset)');
    }
    if (!isAuthTokenSet) {
      throw new Error('authToken is not set');
    }
    const authToken = getAuthToken();

    // Note that for SH v3 service, the endpoint for fetching the list of layers is always
    // https://services.sentinel-hub.com/, even for creodias datasets:
    const url = `https://services.sentinel-hub.com/configuration/v1/wms/instances/${this.instanceId}/layers`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    const res = await axios.get(url, { responseType: 'json', headers: headers, useCache: true });
    const layersParams = res.data.map((l: any) => ({
      layerId: l.id,
      ...l.datasourceDefaults,
      evalscript: l.styles[0].evalScript,
      dataProduct: l.styles[0].dataProduct,
    }));

    const layerParams = layersParams.find((l: any) => l.layerId === this.layerId);
    if (!layerParams) {
      throw new Error('Layer params could not be found');
    }
    return layerParams;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    // Subclasses should override this method if they wish to supply additional
    // parameters to Processing API.
    // Typically, if additional layer data is needed for that, this code will be called:
    //   const layerParams = await this.fetchLayerParamsFromSHServiceV3();
    return payload;
  }

  protected getShServiceHostname(): string {
    return this.dataset.shServiceHostname;
  }

  protected async fetchEvalscriptUrlIfNeeded(): Promise<void> {
    if (this.evalscriptUrl && !this.evalscript) {
      const response = await axios.get(this.evalscriptUrl, { responseType: 'text', useCache: true });
      this.evalscript = response.data;
    }
  }

  protected async convertEvalscriptToV3IfNeeded(): Promise<void> {
    // Convert internal evalscript to V3 if it's not in that version.
    if (this.evalscriptWasConvertedToV3 || !this.evalscript) {
      return;
    }
    if (!this.evalscript.startsWith('//VERSION=3')) {
      this.evalscript = await this.convertEvalscriptToV3(this.evalscript);
    }
    this.evalscriptWasConvertedToV3 = true;
  }

  public async getMap(params: GetMapParams, api: ApiType): Promise<Blob> {
    // SHv3 services support Processing API:
    if (api === ApiType.PROCESSING) {
      if (!this.dataset) {
        throw new Error('This layer does not support Processing API (unknown dataset)');
      }

      await this.fetchEvalscriptUrlIfNeeded();

      let layerParams = null;
      if (!this.evalscript && !this.dataProduct) {
        layerParams = await this.fetchLayerParamsFromSHServiceV3();
        if (layerParams.evalscript) {
          this.evalscript = layerParams.evalscript;
        } else if (layerParams.dataProduct) {
          this.dataProduct = layerParams.dataProduct;
        } else {
          throw new Error(`Could not fetch evalscript / dataProduct from service for layer ${this.layerId}`);
        }
      }
      if (!this.mosaickingOrder && this.instanceId && this.layerId) {
        if (!layerParams) {
          layerParams = await this.fetchLayerParamsFromSHServiceV3();
        }
        this.mosaickingOrder = layerParams.mosaickingOrder;
      }

      await this.convertEvalscriptToV3IfNeeded();

      const payload = createProcessingPayload(
        this.dataset,
        params,
        this.evalscript,
        this.dataProduct,
        this.mosaickingOrder,
      );
      // allow subclasses to update payload with their own parameters:
      const updatedPayload = await this.updateProcessingGetMapPayload(payload);
      const shServiceHostname = this.getShServiceHostname();
      return processingGetMap(shServiceHostname, updatedPayload);
    }

    return super.getMap(params, api);
  }

  public supportsApiType(api: ApiType): boolean {
    return api === ApiType.WMS || (api === ApiType.PROCESSING && !!this.dataset);
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    if (this.mosaickingOrder) {
      return {
        priority: this.mosaickingOrder,
      };
    }
    return {};
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('This API type does not support GET HTTP method!');
    }
    if (!this.dataset) {
      throw new Error('This layer does not have a dataset specified');
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

  protected createSearchIndexRequestConfig(): AxiosRequestConfig {
    const requestConfig: AxiosRequestConfig = {
      headers: { 'Accept-CRS': 'EPSG:4326' },
    };
    return requestConfig;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTiles(
      this.dataset.searchIndexUrl,
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
    );
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
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [];
  }

  protected fetchTiles(
    searchIndexUrl: string,
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number = 1,
    offset: number = 0,
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Promise<{ data: { tiles: any[]; hasMore: boolean } }> {
    if (!searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    const bboxPolygon = bbox.toGeoJSON();
    // Note: we are requesting maxCloudCoverage as a number between 0 and 1, but in
    // the tiles we get cloudCoverPercentage (0..100).
    const payload: any = {
      clipping: bboxPolygon,
      maxcount: maxCount,
      maxCloudCoverage: maxCloudCoverPercent ? maxCloudCoverPercent / 100 : null,
      timeFrom: fromTime.toISOString(),
      timeTo: toTime.toISOString(),
      offset: offset,
    };

    if (datasetParameters) {
      payload.datasetParameters = datasetParameters;
    }

    return axios.post(searchIndexUrl, payload, this.createSearchIndexRequestConfig());
  }

  protected async getFindDatesUTCAdditionalParameters(): Promise<Record<string, any>> {
    return {};
  }

  protected getStatsAdditionalParameters(): Record<string, any> {
    return {};
  }

  protected async getFindDatesUTCUrl(): Promise<string> {
    return this.dataset.findDatesUTCUrl;
  }

  public async findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    const findDatesUTCUrl = await this.getFindDatesUTCUrl();
    if (!findDatesUTCUrl) {
      throw new Error('This dataset does not support searching for dates');
    }

    const bboxPolygon = bbox.toGeoJSON();
    const payload: any = {
      queryArea: bboxPolygon,
      from: fromTime.toISOString(),
      to: toTime.toISOString(),
      ...(await this.getFindDatesUTCAdditionalParameters()),
    };
    const response = await axios.post(findDatesUTCUrl, payload);
    const found: Moment[] = response.data.map((date: string) => moment.utc(date));

    // S-5P, S-3 and possibly other datasets return the results in reverse order (leastRecent).
    // Let's sort the data so that we always return most recent results first:
    found.sort((a, b) => b.unix() - a.unix());
    return found.map(m => m.toDate());
  }

  public async getStats(params: GetStatsParams): Promise<Stats> {
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

    const shServiceHostname = this.getShServiceHostname();
    const { data } = await axios.post(shServiceHostname + 'ogc/fis/' + this.instanceId, payload);
    // convert date strings to Date objects
    for (let channel in data) {
      data[channel] = data[channel].map((dailyStats: any) => ({
        ...dailyStats,
        date: new Date(dailyStats.date),
      }));
    }
    return data;
  }

  protected async convertEvalscriptToV3(evalscript: string): Promise<string> {
    const authToken = getAuthToken();
    const url = this.getConvertScriptBaseUrl();
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/ecmascript',
      },
      useCache: true,
      responseType: 'text',
    };
    const res = await axios.post(url, evalscript, requestConfig);
    return res.data;
  }

  protected getConvertScriptBaseUrl(): string {
    const shServiceHostname = this.getShServiceHostname();
    return `${shServiceHostname}api/v1/process/convertscript?datasetType=${this.dataset.shProcessingApiDatasourceAbbreviation}`;
  }
}
