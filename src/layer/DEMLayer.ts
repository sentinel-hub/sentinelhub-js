import { DATASET_AWS_DEM } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import {
  ApiType,
  DataProductId,
  DEMInstanceType,
  GetMapParams,
  Interpolator,
  MosaickingOrder,
  PaginatedTiles,
} from './const';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { BBox } from '../bbox';
import { Polygon } from '@turf/helpers';
import moment from 'moment';

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
  demInstance?: DEMInstanceType | null;
  egm?: boolean | null;
  clampNegative?: boolean | null;
}

export class DEMLayer extends AbstractSentinelHubV3Layer {
  private demInstance: DEMInstanceType;
  public readonly dataset = DATASET_AWS_DEM;

  public constructor({ demInstance, ...rest }: ConstructorParameters) {
    super(rest);
    this.demInstance = demInstance;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "Some of layer parameters (collectionId, locationId) are not set and can't be fetched from service because instanceId and layerId are not available",
        );
      }

      if (!this.demInstance) {
        const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);

        if (!this.demInstance) {
          this.demInstance = layerParams['demInstance'] ? layerParams['demInstance'] : DEMInstanceType.MAPZEN;
        }
        if (!this.evalscript) {
          this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
        }
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    const getMapValue = await ensureTimeout(async innerReqConfig => {
      await this.updateLayerFromServiceIfNeeded(innerReqConfig);
      return await super.getMap(params, api, innerReqConfig);
    }, reqConfig);
    return getMapValue;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload = await super.updateProcessingGetMapPayload(payload);
    payload.input.data[0].dataFilter.demInstance = this.demInstance;
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

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    const tiles = [];
    let hasMore = false;

    const stopDate = fromTime ? moment.utc(fromTime) : moment.utc(toTime);
    const iterDate = moment.utc(toTime);

    while (iterDate.diff(stopDate) > 0) {
      if (maxCount && tiles.length >= maxCount) {
        hasMore = true;
        break;
      }
      tiles.push({ geometry: this.bboxToPolygon(bbox), sensingTime: iterDate.toDate(), meta: {} });
      iterDate.subtract(1, 'days');
    }

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
