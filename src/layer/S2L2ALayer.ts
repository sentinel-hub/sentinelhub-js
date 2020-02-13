import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S2L2A } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class S2L2ALayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S2L2A;
  protected maxCloudCoverPercent: number;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    maxCloudCoverPercent: number | null = 100,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getProcessingAPIAdditionalDataFilterParams(): Record<string, any> {
    return {
      maxCloudCoverage: this.maxCloudCoverPercent,
    };
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    maxCloudCoverPercent?: number,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTiles(bbox, fromTime, toTime, maxCount, offset, maxCloudCoverPercent);
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
}
