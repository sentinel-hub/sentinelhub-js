import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S5PL2 } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from 'src/layer/processing';
import moment, { Moment } from 'moment';

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
  // minQa?: number;
};

export class S5PL2Layer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S5PL2;
  public productType: ProductType;
  public maxCloudCoverPercent: number;
  public minQa: number | null;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    productType: ProductType | null = null,
    maxCloudCoverPercent: number | null = 100,
    minQa: number | null = null,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.productType = productType;
    this.maxCloudCoverPercent = maxCloudCoverPercent;
    this.minQa = minQa;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    if (this.minQa !== null) {
      payload.input.data[0].processing.minQa = this.minQa;
    }
    // note that productType is not present among the parameters:
    // https://docs.sentinel-hub.com/api/latest/reference/#operation/process
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Moment,
    toTime: Moment,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    if (this.productType === null) {
      throw new Error('Parameter productType must be specified!');
    }
    const findTilesDatasetParameters: S5PL2FindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      productType: this.productType,
      // minQa: this.minQa,
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
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.tileDrawRegionGeometry,
          sensingTime: moment.utc(tile.sensingTime),
          meta: {},
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  // public async findDates(
  //   bbox: BBox,
  //   fromTime: Moment,
  //   toTime: Moment,
  //   datasetSpecificParameters?: { productType?: ProductType },
  // ): Promise<Moment[]> {
  //   const findDatesDatasetParameters: S5PL2FindTilesDatasetParameters = {
  //     type: this.dataset.datasetParametersType,
  //     productType:
  //       datasetSpecificParameters && datasetSpecificParameters.productType
  //         ? datasetSpecificParameters.productType
  //         : undefined,
  //   };

  //   return super.findDates(bbox, fromTime, toTime, { datasetParameters: findDatesDatasetParameters });
  // }

  protected getFindDatesAdditionalParameters(): Record<string, any> {
    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
      },
    };
    if (this.productType !== null) {
      result.datasetParameters.productType = this.productType;
    }

    if (this.maxCloudCoverPercent !== null) {
      result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
    }

    console.log('S5PL2 getFindDatesAdditionalParameters', { result });
    return result;
  }
}
