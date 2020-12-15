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

  public constructor({ demInstance, egm, clampNegative, ...rest }: ConstructorParameters) {
    super(rest);
    this.demInstance = demInstance;
    this.egm = egm;
    this.clampNegative = clampNegative;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (!(this.instanceId && this.layerId)) {
        return;
      }
      //update properties defined on parent layer
      await super.updateLayerFromServiceIfNeeded(innerReqConfig);
      //update DEM specific properties if they're not set
      if (!this.demInstance || isBooleanNull(this.egm) || isBooleanNull(this.clampNegative)) {
        const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);
        if (!this.demInstance) {
          this.demInstance = layerParams['demInstance'] ? layerParams['demInstance'] : DEMInstanceType.MAPZEN;
        }
        if (isBooleanNull(this.clampNegative)) {
          this.clampNegative = layerParams['clampNegative'] ? layerParams['clampNegative'] : false;
        }
        if (isBooleanNull(this.egm)) {
          //this in not a typo. Configuration service returns `EGM`, process api accepts `egm`
          this.egm = layerParams['EGM'] ? layerParams['EGM'] : false;
        }
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    const getMapValue = await ensureTimeout(async innerReqConfig => {
      if (api === ApiType.PROCESSING) {
        await this.updateLayerFromServiceIfNeeded(innerReqConfig);
      }
      return await super.getMap(params, api, innerReqConfig);
    }, reqConfig);
    return getMapValue;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload = await super.updateProcessingGetMapPayload(payload);
    payload.input.data[0].dataFilter.demInstance = this.demInstance;

    if (!isBooleanNull(this.egm)) {
      payload.input.data[0].processing.egm = this.egm;
    }

    if (
      (!this.demInstance || this.demInstance === DEMInstanceType.MAPZEN) &&
      !isBooleanNull(this.clampNegative)
    ) {
      payload.input.data[0].processing.clampNegative = this.clampNegative;
    }

    //DEM doesn't support dates and mosaickingOrder so they can be removed from payload
    delete payload.input.data[0].dataFilter.mosaickingOrder;
    delete payload.input.data[0].dataFilter.timeRange;

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

const isBooleanNull = (value: boolean): boolean => value === null || value == undefined;
