import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles, OrbitDirection } from 'src/layer/const';
import { DATASET_S3SLSTR } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from 'src/layer/processing';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  title?: string | null;
  description?: string | null;
  maxCloudCoverPercent?: number | null;
  view?: 'NADIR' | 'OBLIQUE';
}

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

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
    maxCloudCoverPercent = 100,
    view = 'NADIR',
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
    this.maxCloudCoverPercent = maxCloudCoverPercent;
    // images that are not DESCENDING appear empty:
    this.orbitDirection = OrbitDirection.DESCENDING;
    this.view = view;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    payload.input.data[0].dataFilter.orbitDirection = this.orbitDirection;
    payload.input.data[0].processing.view = this.view;
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
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: {
          cloudCoverPercent: tile.cloudCoverPercentage,
          orbitDirection: tile.orbitDirection,
        },
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected getFindDatesAdditionalParameters(): Record<string, any> {
    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
        view: this.view,
      },
    };
    if (this.orbitDirection !== null) {
      result.datasetParameters.orbitDirection = this.orbitDirection;
    }

    if (this.maxCloudCoverPercent !== null) {
      result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
    }

    return result;
  }
}
