import { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import axios from 'axios';

import { getAuthToken } from 'src/auth';
import { BBox } from 'src/bbox';
import {
  PaginatedTiles,
  LocationIdSHv3,
  SHV3_LOCATIONS_ROOT_URL,
  GetMapParams,
  ApiType,
  RequestConfiguration,
  GetStatsParams,
  Stats,
} from 'src/layer/const';
import { DATASET_BYOC } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from 'src/layer/processing';
import { getAxiosReqParams } from 'src/utils/cancelRequests';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  title?: string | null;
  description?: string | null;
  collectionId?: string | null;
  locationId?: LocationIdSHv3 | null;
}

type BYOCFindTilesDatasetParameters = {
  type: string;
  collectionId: string;
};

export class BYOCLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_BYOC;
  protected collectionId: string;
  protected locationId: LocationIdSHv3;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
    collectionId = null,
    locationId = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
    this.collectionId = collectionId;
    this.locationId = locationId;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    if (this.collectionId !== null && this.locationId !== null) {
      return;
    }

    if (this.instanceId === null || this.layerId === null) {
      throw new Error(
        "Some of layer parameters (collectionId, locationId) are not set and can't be fetched from service because instanceId and layerId are not available",
      );
    }

    if (this.collectionId === null) {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3(reqConfig);
      this.collectionId = layerParams['collectionId'];
    }

    if (this.locationId === null) {
      const url = `https://services.sentinel-hub.com/api/v1/metadata/collection/CUSTOM/${this.collectionId}`;
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const res = await axios.get(url, {
        responseType: 'json',
        headers: headers,
        useCache: false,
        ...getAxiosReqParams(reqConfig),
      });
      this.locationId = res.data.location.id;
    }
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    return await super.getMap(params, api, reqConfig);
  }

  protected async updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    reqConfig: RequestConfiguration,
  ): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    payload.input.data[0].dataFilter.collectionId = this.collectionId;
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);

    const findTilesDatasetParameters: BYOCFindTilesDatasetParameters = {
      type: 'BYOC',
      collectionId: this.collectionId,
    };
    // searchIndex URL depends on the locationId:
    const rootUrl = SHV3_LOCATIONS_ROOT_URL[this.locationId];
    const searchIndexUrl = `${rootUrl}byoc/v3/collections/CUSTOM/searchIndex`;
    const response = await this.fetchTiles(
      searchIndexUrl,
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      reqConfig,
      null,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.dataGeometry,
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: {
            cloudCoverPercent: tile.cloudCoverPercentage,
          },
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  protected getShServiceHostname(): string {
    if (this.locationId === null) {
      throw new Error('Parameter locationId must be specified');
    }
    const shServiceHostname = SHV3_LOCATIONS_ROOT_URL[this.locationId];
    return shServiceHostname;
  }

  protected createSearchIndexRequestConfig(): AxiosRequestConfig {
    return {};
  }

  protected async getFindDatesUTCUrl(reqConfig: RequestConfiguration): Promise<string> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    const rootUrl = SHV3_LOCATIONS_ROOT_URL[this.locationId];
    const findDatesUTCUrl = `${rootUrl}byoc/v3/collections/CUSTOM/findAvailableData`;
    return findDatesUTCUrl;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration,
  ): Promise<Record<string, any>> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);

    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
        collectionId: this.collectionId,
      },
    };
    return result;
  }

  public async getStats(params: GetStatsParams): Promise<Stats> {
    await this.updateLayerFromServiceIfNeeded();
    return super.getStats(params);
  }
}
