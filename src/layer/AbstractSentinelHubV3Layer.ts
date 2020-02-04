import axios from 'axios';

import { getAuthToken, isAuthTokenSet } from 'src/auth';
import { BBox } from 'src/bbox';
import { GetMapParams, ApiType } from 'src/layer/const';
import { fetchCached } from 'src/layer/utils';
import { wmsGetMapUrl } from 'src/layer/wms';
import { processingGetMap, createProcessingPayload, ProcessingPayload } from 'src/layer/processing';
import { AbstractLayer } from 'src/layer/AbstractLayer';

// this class provides any SHv3-specific functionality to the subclasses:
export class AbstractSentinelHubV3Layer extends AbstractLayer {
  protected instanceId: string | null;
  protected layerId: string | null;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;
  protected dataProduct: string | null;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
  ) {
    super(title, description);
    if (layerId === null && evalscript === null && evalscriptUrl === null && dataProduct === null) {
      throw new Error(
        'At least one of the layerId / evalscript / evalscriptUrl / dataProduct must be specified!',
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

    const url = `${this.dataset.shServiceHostname}configuration/v1/wms/instances/${this.instanceId}/layers`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    const res = await fetchCached(url, { responseType: 'json', headers: headers }, false);
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
      if (this.evalscriptUrl) {
        throw new Error('EvalscriptUrl is not supported with Processing API');
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

      // allow subclasses to update payload with their own parameters:
      const payload = createProcessingPayload(this.dataset, params, this.evalscript, this.dataProduct);
      const updatedPayload = await this.updateProcessingGetMapPayload(payload);

      return processingGetMap(this.dataset.shServiceHostname, updatedPayload);
    }

    return super.getMap(params, api);
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
    return wmsGetMapUrl(baseUrl, this.layerId, params, this.evalscript, this.evalscriptUrl, evalsource);
  }

  public setEvalscript(evalscript: string): void {
    this.evalscript = evalscript;
  }

  public setEvalscriptUrl(evalscriptUrl: string): void {
    this.evalscriptUrl = evalscriptUrl;
  }

  protected fetchTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number = 1,
    offset: number = 0,
    maxCloudCoverage?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Promise<{ data: { tiles: any[]; hasMore: boolean } }> {
    if (!this.dataset.searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    const bboxPolygon = {
      type: 'Polygon',
      crs: { type: 'name', properties: { name: bbox.crs.urn } },
      coordinates: [
        [
          [bbox.minY, bbox.maxX],
          [bbox.maxY, bbox.maxX],
          [bbox.maxY, bbox.minX],
          [bbox.minY, bbox.minX],
          [bbox.minY, bbox.maxX],
        ],
      ],
    };
    const payload: any = {
      clipping: bboxPolygon,
      maxcount: maxCount,
      maxCloudCoverage: maxCloudCoverage ? maxCloudCoverage / 100 : null,
      timeFrom: fromTime.toISOString(),
      timeTo: toTime.toISOString(),
      offset: offset,
    };

    if (datasetParameters) {
      payload.datasetParameters = datasetParameters;
    }

    return axios.post(this.dataset.searchIndexUrl, payload, {
      headers: { 'Accept-CRS': 'EPSG:4326' },
    });
  }
}
