import { BBox } from '../bbox';
import { GetMapParams, ApiType, PaginatedTiles, GetStatsParams, Stats, MosaickingOrder, Interpolator, Link } from './const';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticsProviderType } from '../statistics/StatisticsProvider';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    mosaickingOrder?: MosaickingOrder | null;
    title?: string | null;
    description?: string | null;
    upsampling?: Interpolator | null;
    downsampling?: Interpolator | null;
    legendUrl?: string | null;
}
export declare class AbstractSentinelHubV1OrV2Layer extends AbstractLayer {
    protected instanceId: string;
    protected layerId: string;
    protected evalscript: string | null;
    protected evalscriptUrl: string | null;
    protected mosaickingOrder: MosaickingOrder | null;
    protected upsampling: Interpolator | null;
    protected downsampling: Interpolator | null;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, mosaickingOrder, title, description, upsampling, downsampling, legendUrl, }: ConstructorParameters);
    getEvalsource(): string;
    getLayerId(): string;
    getEvalscript(): string;
    getInstanceId(): string;
    protected getWmsGetMapUrlAdditionalParameters(): Record<string, any>;
    getMapUrl(params: GetMapParams, api: ApiType): string;
    setEvalscript(evalscript: string): void;
    setEvalscriptUrl(evalscriptUrl: string): void;
    protected getFindTilesAdditionalParameters(): Record<string, any>;
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected findTilesInner(bbox: BBox, fromTime: Date, toTime: Date, maxCount?: number | null, offset?: number | null, reqConfig?: RequestConfiguration): Promise<PaginatedTiles>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    getStatsAdditionalParameters(): Record<string, any>;
    protected getTileLinks(tile: Record<string, any>): Link[];
    findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date, reqConfig?: RequestConfiguration): Promise<Date[]>;
    getStats(params: GetStatsParams, reqConfig?: RequestConfiguration, statsProvider?: StatisticsProviderType): Promise<Stats>;
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
}
export {};
