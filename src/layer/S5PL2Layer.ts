import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S5PL2 } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from 'src/layer/processing';

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

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  title?: string | null;
  description?: string | null;
  productType?: ProductType | null;
  maxCloudCoverPercent?: number | null;
  minQa?: number | null;
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

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
    productType = null,
    maxCloudCoverPercent = 100,
    minQa = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
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
    fromTime: Date,
    toTime: Date,
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
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: {},
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  protected getFindDatesUTCAdditionalParameters(): Record<string, any> {
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

    return result;
  }

  protected getStatsAndHistogramAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }
}
