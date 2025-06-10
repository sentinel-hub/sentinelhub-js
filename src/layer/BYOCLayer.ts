import { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import axios, { ResponseType } from 'axios';
import { Geometry } from '@turf/helpers';

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
  SH_SERVICE_ROOT_URL,
} from './const';
import { DATASET_BYOC } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getSHServiceRootUrl, metersPerPixel } from './utils';
import { StatisticsProviderType } from '../statistics/const';

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
  shServiceRootUrl?: string;
  highlights?: AbstractSentinelHubV3Layer['highlights'];
}

type BYOCFindTilesDatasetParameters = {
  type: string;
  collectionId: string;
};

export class BYOCLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_BYOC;
  public collectionId: string;
  public locationId: LocationIdSHv3;
  public subType: BYOCSubTypes;
  public shServiceRootUrl: string;
  public lowResolutionCollectionId: string;
  public lowResolutionMetersPerPixelThreshold: number;

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
    shServiceRootUrl = SH_SERVICE_ROOT_URL.default,
    highlights = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, highlights });
    this.collectionId = collectionId;
    this.locationId = locationId;
    this.subType = subType;
    this.shServiceRootUrl = getSHServiceRootUrl(shServiceRootUrl);
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async (innerReqConfig) => {
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
        if (!this.legend) {
          this.legend = layerParams['legend'] ? layerParams['legend'] : null;
        }
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
        this.locationId =
          (Object.entries(SHV3_LOCATIONS_ROOT_URL).find(
            ([, url]) => url === this.shServiceRootUrl,
          )?.[0] as LocationIdSHv3) ?? LocationIdSHv3.awsEuCentral1;
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    return await ensureTimeout(async (innerReqConfig) => {
      params = await this.decideJpegOrPng(params, innerReqConfig);
      await this.updateLayerFromServiceIfNeeded(innerReqConfig);
      return await super.getMap(params, api, innerReqConfig);
    }, reqConfig);
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
    reqConfig?: RequestConfiguration,
    params?: GetMapParams,
  ): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);

    if (this.shouldUseLowResolutionCollection(params?.bbox, payload.output.width)) {
      payload.input.data[datasetSeqNo].type = this.getTypeIdLowRes();
    } else {
      payload.input.data[datasetSeqNo].type = this.getTypeId();
    }

    return payload;
  }

  public shouldUseLowResolutionCollection(bbox: BBox, width: number): boolean {
    return (
      this.lowResolutionCollectionId !== undefined &&
      this.lowResolutionMetersPerPixelThreshold !== undefined &&
      metersPerPixel(bbox, width) > this.lowResolutionMetersPerPixelThreshold
    );
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map((tile) => {
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
    intersects?: Geometry,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    const response = await super.findTilesInner(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      reqConfig,
      intersects,
    );
    return response;
  }

  public getShServiceHostname(): string {
    if (this.locationId === null) {
      throw new Error('Parameter locationId must be specified');
    }
    const shServiceHostname = SHV3_LOCATIONS_ROOT_URL[this.locationId];
    return shServiceHostname;
  }

  protected getTypeId(): string {
    return `${this.getTypePrefix()}-${this.collectionId}`;
  }

  protected getTypeIdLowRes(): string {
    return `${this.getTypePrefix()}-${this.lowResolutionCollectionId}`;
  }

  protected getTypePrefix(): string {
    switch (this.subType) {
      case BYOCSubTypes.BATCH:
        return 'batch';
      case BYOCSubTypes.ZARR:
        return 'zarr';
      default:
        return 'byoc';
    }
  }

  protected getCatalogCollectionId(): string {
    if (this.lowResolutionCollectionId !== undefined) {
      return this.getTypeIdLowRes();
    }
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

  public async getStats(
    params: GetStatsParams,
    reqConfig: RequestConfiguration = {},
    statsProvider: StatisticsProviderType = StatisticsProviderType.FIS,
  ): Promise<Stats> {
    await this.updateLayerFromServiceIfNeeded();
    return super.getStats(params, reqConfig, statsProvider);
  }

  public async getAvailableBands(reqConfig?: RequestConfiguration): Promise<BYOCBand[]> {
    const bandsResponseData = await ensureTimeout(async (innerReqConfig) => {
      if (this.collectionId === null) {
        throw new Error('Parameter collectionId is not set');
      }
      if (this.subType === BYOCSubTypes.ZARR) {
        throw new Error('Fetching available bands for ZARR not supported.');
      }

      const commonReqConfig = {
        responseType: 'json' as ResponseType,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
      };

      const metadataUrl = `${this.getSHServiceRootUrl()}api/v1/catalog/1.0.0/collections/${this.getTypeId()}`;
      const metadataRes = await axios.get(metadataUrl, commonReqConfig);
      const metadataBands: BYOCBand[] = (
        metadataRes.data.summaries['eo:bands'] as { name: string }[] | undefined
      )?.map(({ name }, index) => {
        return {
          name,
          sampleType: metadataRes.data.summaries?.['raster:bands']?.[index]?.data_type?.toUpperCase(),
        };
      });
      return metadataBands;
    }, reqConfig);
    return bandsResponseData;
  }

  public getSHServiceRootUrl(): string {
    return this.shServiceRootUrl;
  }
}
