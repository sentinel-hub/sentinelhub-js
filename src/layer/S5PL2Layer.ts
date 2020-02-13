import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S5PL2 } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

/*
  S-5P is a bit special in that we need to supply productType when searching
  for tiles, but we don't need it for getMap() (it is determined automatically
  from the evalscript).
*/

export enum ProductType {
  AER_AI = 'AER_AI',
  CLOUD = 'CLOUD',
  CO = 'CO',
  HCHO = 'HCHO',
  NO2 = 'NO2',
  O3 = 'O3',
  SO2 = 'SO2',
  CH4 = 'CH4',
}

type S5PL2FindTilesDatasetParameters = {
  type: string;
  productType: ProductType;
};

export class S5PL2Layer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S5PL2;

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    productType?: ProductType,
  ): Promise<PaginatedTiles> {
    const findTilesDatasetParameters: S5PL2FindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      productType: productType,
    };
    const response = await this.fetchTiles(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      null,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.tileDrawRegionGeometry,
          sensingTime: tile.sensingTime,
          meta: {},
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  public async findDates(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    datasetSpecificParameters?: { productType?: ProductType },
  ): Promise<Date[]> {
    const findDatesDatasetParameters: S5PL2FindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      productType: datasetSpecificParameters && datasetSpecificParameters.productType,
    };

    console.log('s5pl2 layer, finddates', { bbox, fromTime, toTime, datasetSpecificParameters });

    return super.findDates(bbox, fromTime, toTime, { datasetParameters: findDatesDatasetParameters });
  }
}
