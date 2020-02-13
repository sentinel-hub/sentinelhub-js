import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S2L2A } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class S2L2ALayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S2L2A;

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    maxCloudCoverage?: number,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTiles(bbox, fromTime, toTime, maxCount, offset, maxCloudCoverage);
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: new Date(tile.sensingTime),
        meta: {
          cloudCoverPercent: tile.cloudCoverPercentage,
        },
      })),
      hasMore: response.data.hasMore,
    };
  }

  public async findDates(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    datasetSpecificParameters?: {
      maxCloudCoverage?: number;
    },
  ): Promise<Date[]> {
    console.log('s2l2a layer, finddates', { bbox, fromTime, toTime, datasetSpecificParameters });

    return super.findDates(bbox, fromTime, toTime, {
      maxCloudCoverage: datasetSpecificParameters && datasetSpecificParameters.maxCloudCoverage,
    });
  }
}
