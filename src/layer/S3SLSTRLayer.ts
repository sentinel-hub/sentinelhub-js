import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S3SLSTR } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { OrbitDirection } from 'src';
import { ProcessingPayload } from 'src/layer/processing';
import moment, { Moment } from 'moment';

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
    fromTime: Moment,
    toTime: Moment,
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
        sensingTime: moment.utc(tile.sensingTime),
        meta: {
          cloudCoverPercent: tile.cloudCoverPercentage,
          orbitDirection: tile.orbitDirection,
        },
      })),
      hasMore: response.data.hasMore,
    };
  }

  public async findDates(
    bbox: BBox,
    fromTime: Moment,
    toTime: Moment,
    datasetSpecificParameters: {
      maxCloudCoverage?: number;
      orbitDirection: OrbitDirection | null;
      view: 'NADIR' | 'OBLIQUE';
    } = { orbitDirection: OrbitDirection.DESCENDING, view: 'NADIR' },
  ): Promise<Moment[]> {
    const findDatesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      orbitDirection: datasetSpecificParameters.orbitDirection,
      view: datasetSpecificParameters.view,
    };

    const maxCC =
      datasetSpecificParameters && datasetSpecificParameters.maxCloudCoverage
        ? datasetSpecificParameters.maxCloudCoverage
        : undefined;

    return super.findDates(bbox, fromTime, toTime, {
      maxCloudCoverage: maxCC,
      datasetParameters: findDatesDatasetParameters,
    });
  }
}
