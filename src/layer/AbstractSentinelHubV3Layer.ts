import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';

import { getAuthToken, isAuthTokenSet } from 'src/auth';
import { BBox } from 'src/bbox';
import { GetMapParams, ApiType, PaginatedTiles } from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { processingGetMap, createProcessingPayload, ProcessingPayload } from 'src/layer/processing';
import { AbstractLayer } from 'src/layer/AbstractLayer';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
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

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
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

  public async getMap(params: GetMapParams, api: ApiType): Promise<Blob> {
    // SHv3 services support Processing API:
    if (api === ApiType.PROCESSING) {
      if (!this.dataset) {
        throw new Error('This layer does not support Processing API (unknown dataset)');
      }
      if (this.evalscriptUrl && !this.evalscript) {
        const response = await axios.get(this.evalscriptUrl, { responseType: 'text', useCache: true });
        let evalscriptV3;
        //Check version of fetched evalscript by checking if first line starts with //VERSION=3
        if (response.data.startsWith('//VERSION=3')) {
          evalscriptV3 = response.data;
        } else {
          evalscriptV3 = await this.convertEvalscriptToV3(response.data);
        }
        this.evalscript = evalscriptV3;
      }
      if (!this.evalscript && !this.dataProduct) {
        const layerParams = await this.fetchLayerParamsFromSHServiceV3();
        if (layerParams.evalscript) {
          this.evalscript = layerParams.evalscript;
        } else if (layerParams.dataProduct) {
          this.dataProduct = layerParams.dataProduct;
        } else {
          throw new Error(`Could not fetch evalscript / dataProduct from service for layer ${this.layerId}`);
        }
      }

      const payload = createProcessingPayload(this.dataset, params, this.evalscript, this.dataProduct);
      // allow subclasses to update payload with their own parameters:
      const updatedPayload = await this.updateProcessingGetMapPayload(payload);

      return processingGetMap(this.dataset.shServiceHostname, updatedPayload);
    }

    return super.getMap(params, api);
  }

  public supportsApiType(api: ApiType): boolean {
    return api === ApiType.WMS || (api === ApiType.PROCESSING && !!this.dataset);
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {};
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('This API type does not support GET HTTP method!');
    }
    if (!this.dataset) {
      throw new Error('This layer does not have a dataset specified');
    }
    const baseUrl = `${this.dataset.shServiceHostname}ogc/wms/${this.instanceId}`;
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
    const response = await this.fetchTiles(bbox, fromTime, toTime, maxCount, offset);
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: {},
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected fetchTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number = 1,
    offset: number = 0,
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Promise<{ data: { tiles: any[]; hasMore: boolean } }> {
    if (!this.dataset.searchIndexUrl) {
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

    return axios.post(this.dataset.searchIndexUrl, payload, this.createSearchIndexRequestConfig());
  }

  protected getFindDatesUTCAdditionalParameters(): Record<string, any> {
    return {};
  }

  public async findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    if (!this.dataset.findDatesUTCUrl) {
      throw new Error('This dataset does not support searching for dates');
    }

    const bboxPolygon = bbox.toGeoJSON();
    const payload: any = {
      queryArea: bboxPolygon,
      from: fromTime.toISOString(),
      to: toTime.toISOString(),
      ...this.getFindDatesUTCAdditionalParameters(),
    };
    const response = await axios.post(this.dataset.findDatesUTCUrl, payload);
    return response.data.map((date: string) => moment.utc(date).toDate());
  }

  protected async convertEvalscriptToV3(evalscript: string): Promise<string> {
    const authToken = getAuthToken();
    const url = `https://services.sentinel-hub.com/api/v1/process/convertscript?datasetType=${this.dataset.shProcessingApiDatasourceAbbreviation}`;
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
}
