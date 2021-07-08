import { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import axios from 'axios';

import { getAuthToken } from '../auth';
import { BBox } from '../bbox';
import {
  PaginatedTiles,
  LocationIdSHv3,
  SHV3_LOCATIONS_ROOT_URL,
  GetMapParams,
  ApiType,
  GetStatsParams,
  Stats,
  DataProductId,
  BYOCBand,
  FindTilesAdditionalParameters,
  BYOCSubTypes,
} from './const';
import { DATASET_BYOC } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  title?: string | null;
  description?: string | null;
  collectionId?: string | null;
  locationId?: LocationIdSHv3 | null;
  subType?: BYOCSubTypes | null;
}

type BYOCFindTilesDatasetParameters = {
  type: string;
  collectionId: string;
};

export class BYOCLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_BYOC;
  protected collectionId: string;
  protected locationId: LocationIdSHv3;
  protected subType: BYOCSubTypes;

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
    subType = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
    this.collectionId = collectionId;
    this.locationId = locationId;
    this.subType = subType;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (this.collectionId !== null && this.locationId !== null) {
        return;
      }

      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "Some of layer parameters (collectionId, locationId) are not set and can't be fetched from service because instanceId and layerId are not available",
        );
      }

      if (this.collectionId === null || this.evalscript === null || this.subType === null) {
        const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
        this.collectionId = layerParams['collectionId'];
        if (!this.evalscript) {
          this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
        }
        if (!this.subType) {
          this.subType = layerParams['subType'] ? layerParams['subType'] : null;
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
      }

      if (this.locationId === null) {
        const url = `https://services.sentinel-hub.com/api/v1/metadata/collection/${this.getTypeId()}`;
        const headers = { Authorization: `Bearer ${getAuthToken()}` };
        const res = await axios.get(url, {
          responseType: 'json',
          headers: headers,
          ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
        });

        this.locationId = res.data.location.id;
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    return await ensureTimeout(async innerReqConfig => {
      params = await this.decideJpegOrPng(params, innerReqConfig);
      await this.updateLayerFromServiceIfNeeded(innerReqConfig);
      return await super.getMap(params, api, innerReqConfig);
    }, reqConfig);
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
    reqConfig?: RequestConfiguration,
  ): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    payload.input.data[datasetSeqNo].type = this.getTypeId();
    return payload;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.dataGeometry,
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: {},
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: BYOCFindTilesDatasetParameters = {
      type: 'BYOC',
      collectionId: this.collectionId,
    };

    return {
      maxCloudCoverPercent: null,
      datasetParameters: findTilesDatasetParameters,
    };
  }

  protected async findTilesInner(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    const response = await super.findTilesInner(bbox, fromTime, toTime, maxCount, offset, reqConfig);
    return response;
  }

  protected getShServiceHostname(): string {
    if (this.locationId === null) {
      throw new Error('Parameter locationId must be specified');
    }
    const shServiceHostname = SHV3_LOCATIONS_ROOT_URL[this.locationId];
    return shServiceHostname;
  }

  protected getTypeId(): string {
    return `${this.subType === BYOCSubTypes.BATCH ? 'batch' : 'byoc'}-${this.collectionId}`;
  }

  protected getCatalogCollectionId(): string {
    return this.getTypeId();
  }

  protected getSearchIndexUrl(): string {
    const rootUrl = this.getShServiceHostname();
    const searchIndexUrl = `${rootUrl}byoc/v3/collections/CUSTOM/searchIndex`;
    return searchIndexUrl;
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

  public async getAvailableBands(reqConfig?: RequestConfiguration): Promise<BYOCBand[]> {
    const bandsResponseData = await ensureTimeout(async innerReqConfig => {
      if (this.collectionId === null) {
        throw new Error('Parameter collectionId is not set');
      }

      const url = `https://services.sentinel-hub.com/api/v1/metadata/collection/${this.getTypeId()}`;
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const res = await axios.get(url, {
        responseType: 'json',
        headers: headers,
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
      });
      return res.data.bands;
    }, reqConfig);
    return bandsResponseData;
  }
}
