import { DataProductId, FindTilesAdditionalParameters, MosaickingOrder } from './const';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { HLSConstellation } from '../dataimport/const';
import { ProcessingPayload } from './processing';
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
    constellation?: HLSConstellation | null;
}
export declare class HLSAWSLayer extends AbstractSentinelHubV3WithCCLayer {
    readonly dataset: import("./dataset").Dataset;
    constellation: HLSConstellation | null;
    constructor({ constellation, ...params }: ConstructorParameters);
    protected createCatalogFilterQuery(maxCloudCoverPercent?: number | null, datasetParameters?: Record<string, any> | null): Record<string, any>;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
}
export {};
