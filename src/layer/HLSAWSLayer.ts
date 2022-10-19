import { DATASET_AWS_HLS } from './dataset';
import { DataProductId, FindTilesAdditionalParameters, MosaickingOrder } from './const';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { HSLConstellation } from '../dataimport/const';

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
  constellation: HSLConstellation;
};

export class HLSAWSLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_HLS;
  public constellation: HSLConstellation | null;

  public constructor({ constellation = null, ...params }: ConstructorParameters) {
    super(params);
    this.constellation = constellation;
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
