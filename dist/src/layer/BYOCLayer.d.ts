import { AxiosRequestConfig } from 'axios';
import { Geometry } from '@turf/helpers';
import { BBox } from '../bbox';
import { PaginatedTiles, LocationIdSHv3, GetMapParams, ApiType, GetStatsParams, Stats, DataProductId, BYOCBand, FindTilesAdditionalParameters, BYOCSubTypes } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticsProviderType } from '../statistics/StatisticsProvider';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    dataProduct?: DataProductId | null;
    title?: string | null;
    description?: string | null;
    collectionId?: string | null;
    locationId?: LocationIdSHv3 | null;
    subType?: BYOCSubTypes | null;
}
export declare class BYOCLayer extends AbstractSentinelHubV3Layer {
    readonly dataset: import("./dataset").Dataset;
    collectionId: string;
    locationId: LocationIdSHv3;
    subType: BYOCSubTypes;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, collectionId, locationId, subType, }: ConstructorParameters);
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number, reqConfig?: RequestConfiguration): Promise<ProcessingPayload>;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
    protected findTilesInner(bbox: BBox, fromTime: Date, toTime: Date, maxCount?: number | null, offset?: number | null, reqConfig?: RequestConfiguration, intersects?: Geometry): Promise<PaginatedTiles>;
    getShServiceHostname(): string;
    protected getTypeId(): string;
    protected getTypePrefix(): string;
    protected getCatalogCollectionId(): string;
    protected getSearchIndexUrl(): string;
    protected createSearchIndexRequestConfig(): AxiosRequestConfig;
    protected getFindDatesUTCUrl(reqConfig: RequestConfiguration): Promise<string>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    getStats(params: GetStatsParams, reqConfig?: RequestConfiguration, statsProvider?: StatisticsProviderType): Promise<Stats>;
    getAvailableBands(reqConfig?: RequestConfiguration): Promise<BYOCBand[]>;
}
export {};
