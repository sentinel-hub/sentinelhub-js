import { AxiosRequestConfig } from 'axios';
import { Geometry } from '@turf/helpers';
import { BBox } from '../bbox';
import { GetMapParams, ApiType, PaginatedTiles, MosaickingOrder, GetStatsParams, Stats, Interpolator, Link, DataProductId, FindTilesAdditionalParameters } from './const';
import { ProcessingPayload } from './processing';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticsProviderType } from '../statistics/StatisticsProvider';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    dataProduct?: DataProductId | null;
    mosaickingOrder?: MosaickingOrder | null;
    title?: string | null;
    description?: string | null;
    upsampling?: Interpolator | null;
    downsampling?: Interpolator | null;
    legendUrl?: string | null;
}
export declare class AbstractSentinelHubV3Layer extends AbstractLayer {
    protected instanceId: string | null;
    protected layerId: string | null;
    protected evalscript: string | null;
    protected evalscriptUrl: string | null;
    protected dataProduct: DataProductId | null;
    legend?: any[] | null;
    mosaickingOrder: MosaickingOrder | null;
    upsampling: Interpolator | null;
    downsampling: Interpolator | null;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, mosaickingOrder, title, description, upsampling, downsampling, legendUrl, }: ConstructorParameters);
    getLayerId(): string;
    getEvalscript(): string;
    getDataProduct(): string;
    getInstanceId(): string;
    protected fetchLayerParamsFromSHServiceV3(reqConfig: RequestConfiguration): Promise<any>;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration): Promise<ProcessingPayload>;
    getShServiceHostname(): string;
    protected getCatalogCollectionId(): string;
    protected getSearchIndexUrl(): string;
    protected fetchEvalscriptUrlIfNeeded(reqConfig: RequestConfiguration): Promise<void>;
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    supportsApiType(api: ApiType): boolean;
    protected getWmsGetMapUrlAdditionalParameters(): Record<string, any>;
    getMapUrl(params: GetMapParams, api: ApiType): string;
    setEvalscript(evalscript: string): void;
    setEvalscriptUrl(evalscriptUrl: string): void;
    protected createSearchIndexRequestConfig(reqConfig: RequestConfiguration): AxiosRequestConfig;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
    protected convertResponseFromCatalog(response: any): PaginatedTiles;
    protected findTilesInner(bbox: BBox, fromTime: Date, toTime: Date, maxCount?: number | null, offset?: number | null, reqConfig?: RequestConfiguration, intersects?: Geometry): Promise<PaginatedTiles>;
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected findTilesUsingSearchIndex(searchIndexUrl: string, bbox: BBox, fromTime: Date, toTime: Date, maxCount: number | null, offset: number | null, reqConfig: RequestConfiguration, findTilesAdditionalParameters: FindTilesAdditionalParameters): Promise<PaginatedTiles>;
    protected createCatalogFilterQuery(maxCloudCoverPercent?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    datasetParameters?: Record<string, any> | null): Record<string, any>;
    protected findTilesUsingCatalog(authToken: string, bbox: BBox, fromTime: Date, toTime: Date, maxCount: number | null, offset: number | null, reqConfig: RequestConfiguration, findTilesAdditionalParameters: FindTilesAdditionalParameters, intersects?: null | Geometry): Promise<Record<string, any>>;
    protected getFindDatesUTCAdditionalParameters(reqConfig?: RequestConfiguration): Promise<Record<string, any>>;
    getStatsAdditionalParameters(): Record<string, any>;
    protected getFindDatesUTCUrl(reqConfig?: RequestConfiguration): Promise<string>;
    findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date, reqConfig?: RequestConfiguration): Promise<Date[]>;
    private findDatesUTCSearchIndex;
    protected findDatesUTCCatalog(innerReqConfig: RequestConfiguration, authToken: string, bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]>;
    getStats(params: GetStatsParams, reqConfig?: RequestConfiguration, statsProvider?: StatisticsProviderType): Promise<Stats>;
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
}
export {};
