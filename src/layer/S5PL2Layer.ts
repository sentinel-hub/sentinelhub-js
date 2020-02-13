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

type S5PL2FindTilesDatasetParameters = {
  type: string;
  productType: ProductType;
  minQa?: number;
};

export class S5PL2Layer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S5PL2;
  protected productType: ProductType;
  protected maxCloudCoverPercent: number;
  protected minQa: number | null;

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
    if (productType === null) {
      throw new Error('Parameter productType must be specified!');
    }
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
    const findTilesDatasetParameters: S5PL2FindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      productType: this.productType,
      minQa: this.minQa,
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
          sensingTime: tile.sensingTime,
          meta: {},
        };
      }),
      hasMore: response.data.hasMore,
    };
  }
}
