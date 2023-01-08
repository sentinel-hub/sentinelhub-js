import { Geometry } from '@turf/helpers';
import { BBox } from '../bbox';
import { GetMapParams, ApiType, PaginatedTiles, FlyoverInterval } from './const';
import { Dataset } from './dataset';
import { RequestConfiguration } from '../utils/cancelRequests';
interface ConstructorParameters {
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
}
export declare class AbstractLayer {
    title: string | null;
    description: string | null;
    readonly dataset: Dataset | null;
    legendUrl: string | null;
    constructor({ title, description, legendUrl }: ConstructorParameters);
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    protected decideJpegOrPng(params: GetMapParams, reqConfig: RequestConfiguration): Promise<GetMapParams>;
    getHugeMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    supportsApiType(api: ApiType): boolean;
    getMapUrl(params: GetMapParams, api: ApiType): string;
    setEvalscript(evalscript: string): void;
    setEvalscriptUrl(evalscriptUrl: string): void;
    protected findTilesInner(bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
    intersects?: Geometry): Promise<PaginatedTiles>;
    findTiles(bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
    intersects?: Geometry): Promise<PaginatedTiles>;
    findFlyovers(bbox: BBox, fromTime: Date, toTime: Date, maxFindTilesRequests?: number | null, tilesPerRequest?: number | null, reqConfig?: RequestConfiguration, overrideOrbitTimeMinutes?: number | null): Promise<FlyoverInterval[]>;
    private calculateCoveragePercent;
    private roundCoordinates;
    findDatesUTC(bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration): Promise<Date[]>;
    /**
     * @deprecated Please use findDatesUTC() instead.
     */
    findDates(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]>;
    getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any>;
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
}
export {};
