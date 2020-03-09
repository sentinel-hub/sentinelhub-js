import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S3OLCI } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class S3OLCILayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S3OLCI;

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
}
