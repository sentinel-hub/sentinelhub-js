import moment from 'moment';

import { BBox } from '../bbox';
import { PaginatedTiles, Link, LinkType, DataProductId, FindTilesAdditionalParameters } from './const';
import { DATASET_S5PL2 } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';

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
  dataProduct?: DataProductId | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
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
    legendUrl = null,
    productType = null,
    maxCloudCoverPercent = 100,
    minQa = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl });
    this.productType = productType;
    this.maxCloudCoverPercent = maxCloudCoverPercent;
    this.minQa = minQa;
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    if (this.minQa !== null) {
      payload.input.data[datasetSeqNo].processing.minQa = this.minQa;
    }
    // note that productType is not present among the parameters:
    // https://docs.sentinel-hub.com/api/latest/reference/#operation/process
    return payload;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.tileDrawRegionGeometry,
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: {},
          links: this.getTileLinks(tile),
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: S5PL2FindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      productType: this.productType,
      // minQa: this.minQa,
    };

    return {
      maxCloudCoverPercent: this.maxCloudCoverPercent,
      datasetParameters: findTilesDatasetParameters,
    };
  }

  protected async findTilesInner(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    if (this.productType === null) {
      throw new Error('Parameter productType must be specified!');
    }

    const response = await super.findTilesInner(bbox, fromTime, toTime, maxCount, offset, reqConfig);
    return response;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
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

  protected getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.originalId.replace('EODATA', '/eodata'),
        type: LinkType.CREODIAS,
      },
    ];
  }

  protected createCatalogPayloadQuery(
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Record<string, any> {
    let result = { ...super.createCatalogPayloadQuery(maxCloudCoverPercent, datasetParameters) };

    if (datasetParameters && datasetParameters.productType) {
      result['type'] = {
        eq: datasetParameters.productType,
      };
    }

    return result;
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (assets.data) {
      result.push({ target: assets.data.href.replace('s3://EODATA', '/eodata'), type: LinkType.CREODIAS });
    }
    return result;
  }
}
