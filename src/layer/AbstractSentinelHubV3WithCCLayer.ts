import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles, MosaickingOrder } from 'src/layer/const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
  maxCloudCoverPercent?: number | null;
}

// same as AbstractSentinelHubV3Layer, but with maxCloudCoverPercent (for layers which support it)
export class AbstractSentinelHubV3WithCCLayer extends AbstractSentinelHubV3Layer {
  public maxCloudCoverPercent: number;

  public constructor({ maxCloudCoverPercent = 100, ...rest }: ConstructorParameters) {
    super(rest);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      ...super.getWmsGetMapUrlAdditionalParameters(),
      maxcc: this.maxCloudCoverPercent,
    };
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTiles(
      this.dataset.searchIndexUrl,
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      this.maxCloudCoverPercent,
    );
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: {
          cloudCoverPercent: tile.cloudCoverPercentage,
        },
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected async getFindDatesUTCAdditionalParameters(): Promise<Record<string, any>> {
    return {
      maxCloudCoverage: this.maxCloudCoverPercent / 100,
    };
  }
  protected getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }
}
