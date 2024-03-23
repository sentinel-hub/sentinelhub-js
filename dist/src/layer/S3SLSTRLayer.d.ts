import { PaginatedTiles, OrbitDirection, Link, DataProductId, FindTilesAdditionalParameters } from './const';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    dataProduct?: DataProductId | null;
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
    maxCloudCoverPercent?: number | null;
    view?: S3SLSTRView | null;
}
export declare enum S3SLSTRView {
    NADIR = "NADIR",
    OBLIQUE = "OBLIQUE"
}
export declare class S3SLSTRLayer extends AbstractSentinelHubV3WithCCLayer {
    readonly dataset: import("./dataset").Dataset;
    orbitDirection: OrbitDirection | null;
    view: S3SLSTRView;
    constructor({ view, ...rest }: ConstructorParameters);
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
export {};
