import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ApiType, DataProductId, DEMInstanceType, GetMapParams, Interpolator, PaginatedTiles } from './const';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { BBox } from '../bbox';
import { Polygon } from '@turf/helpers';
import moment from 'moment';

export interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  title?: string | null;
  description?: string | null;
  upsampling?: Interpolator | null;
  downsampling?: Interpolator | null;
  legendUrl?: string | null;
  demInstance?: DEMInstanceType | null;
  egm?: boolean | null;
  clampNegative?: boolean | null;
}

export class AbstractDEMLayer extends AbstractSentinelHubV3Layer {
  protected demInstance: DEMInstanceType;
  protected egm: boolean = null;
  protected clampNegative: boolean = null;
  private layerUpdatedFromService: boolean = false;

  public constructor({ demInstance, egm, clampNegative, ...rest }: ConstructorParameters) {
    super(rest);
    this.demInstance = demInstance;
    this.egm = egm;
    this.clampNegative = clampNegative;
  }

  public getDemInstance(): DEMInstanceType | null {
    return this.demInstance;
  }

  private shouldUpdateLayerFromService(): boolean {
    //don't update layer info if layer has already been updated
    if (this.layerUpdatedFromService) {
      return false;
    }
    //update from service if any of DEM parameters is not set
    return !(this.demInstance && isDefined(this.egm) && isDefined(this.clampNegative));
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (!(this.instanceId && this.layerId)) {
        return;
      }
      //update properties defined on parent layer
      await super.updateLayerFromServiceIfNeeded(innerReqConfig);
      //update DEM specific properties if they're not set
      if (this.shouldUpdateLayerFromService()) {
        const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
        if (!this.demInstance) {
          this.demInstance = layerParams['demInstance'] ? layerParams['demInstance'] : null;
        }
        if (!isDefined(this.clampNegative)) {
          this.clampNegative = layerParams['clampNegative'] ? layerParams['clampNegative'] : null;
        }
        if (!isDefined(this.egm)) {
          //this in not a typo. Configuration service returns `EGM`, process api accepts `egm`
          this.egm = layerParams['EGM'] ? layerParams['EGM'] : null;
        }
        this.layerUpdatedFromService = true;
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    return await ensureTimeout(async innerReqConfig => {
      params = await this.decideJpegOrPng(params, innerReqConfig);
      if (api === ApiType.PROCESSING) {
        await this.updateLayerFromServiceIfNeeded(innerReqConfig);
      }
      return await super.getMap(params, api, innerReqConfig);
    }, reqConfig);
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload = await super._updateProcessingGetMapPayload(payload);
    if (this.demInstance) {
      payload.input.data[datasetSeqNo].dataFilter.demInstance = this.demInstance;
    }

    if (isDefined(this.egm)) {
      payload.input.data[datasetSeqNo].processing.egm = this.egm;
    }

    //clampNegative is MAPZEN specific option
    if ((!this.demInstance || this.demInstance === DEMInstanceType.MAPZEN) && isDefined(this.clampNegative)) {
      payload.input.data[datasetSeqNo].processing.clampNegative = this.clampNegative;
    }

    //DEM doesn't support dates and mosaickingOrder so they can be removed from payload
    delete payload.input.data[datasetSeqNo].dataFilter.mosaickingOrder;
    delete payload.input.data[datasetSeqNo].dataFilter.timeRange;

    return payload;
  }

  private bboxToPolygon(bbox: BBox): Polygon {
    const west = Number(bbox.minX);
    const south = Number(bbox.minY);
    const east = Number(bbox.maxX);
    const north = Number(bbox.maxY);

    const southWest = [west, south];
    const northWest = [west, north];
    const northEast = [east, north];
    const southEast = [east, south];
    return {
      type: 'Polygon',
      crs: {
        type: 'name',
        properties: {
          name: bbox.crs.urn,
        },
      },
      coordinates: [[southWest, southEast, northEast, northWest, southWest]],
    };
  }

  // Since DEM dataset doesn't have dates/tiles we mock tiles by always returning
  //one "tile" which is covering input bounding box on the date of intervals end.

  public async findTiles(
    bbox: BBox,
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date,
    maxCount: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    const tiles = [];
    let hasMore = false;

    tiles.push({
      geometry: this.bboxToPolygon(bbox),
      sensingTime: moment.utc(toTime).toDate(),
      meta: {},
    });

    return { tiles: tiles, hasMore: hasMore };
  }

  public async findDatesUTC(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Date[]> {
    const { tiles } = await this.findTiles(bbox, fromTime, toTime);
    return tiles.map(tile => moment.utc(tile.sensingTime).toDate());
  }
}

const isDefined = (value: any): boolean => value !== null && value !== undefined;
