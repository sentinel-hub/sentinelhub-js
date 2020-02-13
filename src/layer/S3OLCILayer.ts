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
        sensingTime: new Date(tile.sensingTime),
        meta: {},
      })),
      hasMore: response.data.hasMore,
    };
  }

  // public async findDates(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
  //   const response = await this.fetchDates(bbox, fromTime, toTime);
  //   return response.data.map(date => new Date(date));
  // }

  public async findDates(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    console.log('s3olci layer, finddates', { bbox, fromTime, toTime });

    return super.findDates(bbox, fromTime, toTime);
  }
}
