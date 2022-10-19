import { DATASET_AWS_HLS } from './dataset';
import { DataProductId, FindTilesAdditionalParameters, MosaickingOrder } from './const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ProcessingPayload } from './processing';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  maxCloudCoverPercent?: number | null;
  constellation?: any | null;
}

type HLSFindTilesDatasetParameters = {
  type: string;
  constellation: Constellation;
};

export enum Constellation {
  LANDSAT = 'LANDSAT',
  SENTINEL = 'SENTINEL',
}

export class HLSAWSLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_HLS;
  public constellation: Constellation | null;

  public constructor({ constellation = null, ...params }: ConstructorParameters) {
    super(params);
    this.constellation = constellation;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      ...super.getWmsGetMapUrlAdditionalParameters(),
      constellation: this.constellation,
    };
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload = await super._updateProcessingGetMapPayload(payload);
    payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    payload.input.data[datasetSeqNo].dataFilter.constellation = this.constellation;
    return payload;
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    let result: Record<string, any> = {};

    if (!feature) {
      return result;
    }

    result = {
      ...super.extractFindTilesMetaFromCatalog(feature),
      cloudCoverPercent: feature.properties['eo:cloud_cover'],
    };

    return result;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
      },
    };

    if (this.maxCloudCoverPercent !== null && this.maxCloudCoverPercent !== undefined) {
      result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
    }

    if (this.constellation !== null && this.constellation !== undefined) {
      result.datasetParameters.constellation = this.constellation;
    }

    return result;
  }

  public getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
      constellation: this.constellation,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      cloudCoverPercent: tile.cloudCoverPercentage,
    };
  }

  protected createCatalogFilterQuery(
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Record<string, any> {
    let result = { ...super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) };
    let args: { op: string; args: any[] }[] = [];

    if (maxCloudCoverPercent !== null && maxCloudCoverPercent !== undefined) {
      args.push({
        op: '<=',
        args: [{ property: 'eo:cloud_cover' }, maxCloudCoverPercent],
      });
    }

    if (datasetParameters && datasetParameters.constellation) {
      args.push({
        op: '=',
        args: [{ property: 'constellation' }, datasetParameters.constellation],
      });
    }

    if (args.length > 0) {
      result.op = 'and';
      result.args = args;
    }

    return result && Object.keys(result).length > 0 ? result : null;
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: HLSFindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      constellation: this.constellation,
    };

    return {
      maxCloudCoverPercent: this.maxCloudCoverPercent,
      datasetParameters: findTilesDatasetParameters,
    };
  }
}
