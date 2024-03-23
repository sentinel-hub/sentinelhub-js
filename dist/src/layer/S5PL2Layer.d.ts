import { Geometry } from '@turf/helpers';
import { BBox } from '../bbox';
import { PaginatedTiles, Link, DataProductId, FindTilesAdditionalParameters } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
export declare enum ProductType {
    AER_AI = "AER_AI",
    CLOUD = "CLOUD",
    CO = "CO",
    HCHO = "HCHO",
    NO2 = "NO2",
    O3 = "O3",
    SO2 = "SO2",
    CH4 = "CH4"
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
export declare class S5PL2Layer extends AbstractSentinelHubV3Layer {
    readonly dataset: import("./dataset").Dataset;
    productType: ProductType;
    maxCloudCoverPercent: number;
    minQa: number | null;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl, productType, maxCloudCoverPercent, minQa, }: ConstructorParameters);
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
    protected findTilesInner(bbox: BBox, fromTime: Date, toTime: Date, maxCount?: number | null, offset?: number | null, reqConfig?: RequestConfiguration, intersects?: Geometry): Promise<PaginatedTiles>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    getStatsAdditionalParameters(): Record<string, any>;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected createCatalogFilterQuery(maxCloudCoverPercent?: number | null, datasetParameters?: Record<string, any> | null): Record<string, any>;
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
export {};
