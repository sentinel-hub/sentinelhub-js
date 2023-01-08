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
export declare class AbstractSentinelHubV3WithCCLayer extends AbstractSentinelHubV3Layer {
    maxCloudCoverPercent: number;
    constructor({ maxCloudCoverPercent, ...rest }: ConstructorParameters);
    protected getWmsGetMapUrlAdditionalParameters(): Record<string, any>;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    getStatsAdditionalParameters(): Record<string, any>;
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected createCatalogFilterQuery(maxCloudCoverPercent?: number | null, datasetParameters?: Record<string, any> | null): Record<string, any>;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
}
export {};
