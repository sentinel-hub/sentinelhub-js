import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S3SLSTR } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { OrbitDirection } from 'src';

type S3SLSTRFindTilesDatasetParameters = {
  type?: string;
  orbitDirection?: OrbitDirection;
  view: 'NADIR' | 'OBLIQUE';
};

export class S3SLSTRLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S3SLSTR;

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    maxCloudCoverage?: number,
    orbitDirection: OrbitDirection | null = OrbitDirection.DESCENDING,
    view: 'NADIR' | 'OBLIQUE' = 'NADIR',
  ): Promise<PaginatedTiles> {
    const findTilesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      orbitDirection: orbitDirection,
      view: view,
    };
    const response = await this.fetchTiles(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      maxCloudCoverage,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: new Date(tile.sensingTime),
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
    fromTime: Date,
    toTime: Date,
    datasetSpecificParameters: {
      maxCloudCoverage?: number;
      orbitDirection: OrbitDirection | null;
      view: 'NADIR' | 'OBLIQUE';
    } = { orbitDirection: OrbitDirection.DESCENDING, view: 'NADIR' },
  ): Promise<Date[]> {
    const findDatesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      orbitDirection: datasetSpecificParameters.orbitDirection,
      view: datasetSpecificParameters.view,
    };

    console.log('s3slstr layer, finddates', { bbox, fromTime, toTime, datasetSpecificParameters });

    return super.findDates(bbox, fromTime, toTime, {
      maxCloudCoverage: datasetSpecificParameters && datasetSpecificParameters.maxCloudCoverage,
      datasetParameters: findDatesDatasetParameters,
    });
  }
}
