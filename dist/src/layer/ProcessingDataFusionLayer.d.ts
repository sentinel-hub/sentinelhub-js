import { BBox } from '../bbox';
import { GetMapParams, Interpolator, PreviewMode, ApiType, PaginatedTiles, MosaickingOrder } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
interface ConstructorParameters {
    evalscript: string | null;
    evalscriptUrl?: string | null;
    layers: DataFusionLayerInfo[];
    title?: string | null;
    description?: string | null;
}
export declare type DataFusionLayerInfo = {
    layer: AbstractSentinelHubV3Layer;
    id?: string;
    fromTime?: Date;
    toTime?: Date;
    preview?: PreviewMode;
    mosaickingOrder?: MosaickingOrder;
    upsampling?: Interpolator;
    downsampling?: Interpolator;
};
export declare const DEFAULT_SH_SERVICE_HOSTNAME = "https://services.sentinel-hub.com/";
export declare class ProcessingDataFusionLayer extends AbstractSentinelHubV3Layer {
    protected layers: DataFusionLayerInfo[];
    constructor({ title, description, evalscript, evalscriptUrl, layers, }: ConstructorParameters);
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    supportsApiType(api: ApiType): boolean;
    findTiles(bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration): Promise<PaginatedTiles>;
    findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]>;
}
export {};
