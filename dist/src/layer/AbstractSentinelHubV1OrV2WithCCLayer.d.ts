import { MosaickingOrder } from './const';
import { AbstractSentinelHubV1OrV2Layer } from './AbstractSentinelHubV1OrV2Layer';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    title?: string | null;
    description?: string | null;
    maxCloudCoverPercent?: number | null;
    mosaickingOrder?: MosaickingOrder | null;
}
export declare class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
    maxCloudCoverPercent: number;
    constructor({ maxCloudCoverPercent, ...rest }: ConstructorParameters);
    protected getWmsGetMapUrlAdditionalParameters(): Record<string, any>;
    protected getFindTilesAdditionalParameters(): Record<string, any>;
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected getFindDatesUTCAdditionalParameters(): Promise<Record<string, any>>;
    getStatsAdditionalParameters(): Record<string, any>;
}
export {};
