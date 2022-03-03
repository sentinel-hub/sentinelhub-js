import { MosaickingOrder, DataProductId, FindTilesAdditionalParameters } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';

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
}

// same as AbstractSentinelHubV3Layer, but with maxCloudCoverPercent (for layers which support it)
export class AbstractSentinelHubV3WithCCLayer extends AbstractSentinelHubV3Layer {
  public maxCloudCoverPercent: number;

  public constructor({ maxCloudCoverPercent = 100, ...rest }: ConstructorParameters) {
    super(rest);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      ...super.getWmsGetMapUrlAdditionalParameters(),
      maxcc: this.maxCloudCoverPercent,
    };
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload = await super._updateProcessingGetMapPayload(payload);
    payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
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
    return this.maxCloudCoverPercent !== null && this.maxCloudCoverPercent !== undefined
      ? {
          maxCloudCoverage: this.maxCloudCoverPercent / 100,
        }
      : {};
  }
  public getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      cloudCoverPercent: tile.cloudCoverPercentage,
    };
  }

  protected createCatalogPayloadQuery(
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Record<string, any> {
    let result = { ...super.createCatalogPayloadQuery(maxCloudCoverPercent, datasetParameters) };

    if (maxCloudCoverPercent !== null && maxCloudCoverPercent !== undefined) {
      result['eo:cloud_cover'] = {
        lte: maxCloudCoverPercent,
      };
    }
    return result && Object.keys(result).length > 0 ? result : null;
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    return {
      maxCloudCoverPercent: this.maxCloudCoverPercent,
      datasetParameters: null,
    };
  }
}
