import dayjs from 'dayjs';

import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S3SLSTR } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { OrbitDirection } from 'src';
import { ProcessingPayload } from 'src/layer/processing';

type S3SLSTRFindTilesDatasetParameters = {
  type?: string;
  orbitDirection?: OrbitDirection;
  view: 'NADIR' | 'OBLIQUE';
};

export class S3SLSTRLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S3SLSTR;
  public maxCloudCoverPercent: number;
  public orbitDirection: OrbitDirection | null;
  public view: 'NADIR' | 'OBLIQUE';

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    maxCloudCoverPercent: number | null = 100,
    view: 'NADIR' | 'OBLIQUE' = 'NADIR',
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
    // images that are not DESCENDING are blank, so we can hardcode this:
    this.orbitDirection = OrbitDirection.DESCENDING;
    this.view = view;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
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
  ): Promise<PaginatedTiles> {
    const findTilesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      orbitDirection: this.orbitDirection,
      view: this.view,
    };
    const response = await this.fetchTiles(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      this.maxCloudCoverPercent,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: dayjs.utc(tile.sensingTime).toDate(),
        meta: {
          cloudCoverPercent: tile.cloudCoverPercentage,
          orbitDirection: tile.orbitDirection,
        },
      })),
      hasMore: response.data.hasMore,
    };
  }
}
