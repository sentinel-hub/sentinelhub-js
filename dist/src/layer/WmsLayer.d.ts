import { BBox } from '../bbox';
import { GetMapParams, ApiType } from './const';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
interface ConstructorParameters {
    baseUrl?: string;
    layerId?: string;
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
}
export declare class WmsLayer extends AbstractLayer {
    protected baseUrl: string;
    protected layerId: string;
    constructor({ baseUrl, layerId, title, description, legendUrl, }: ConstructorParameters);
    getMapUrl(params: GetMapParams, api: ApiType): string;
    findDatesUTC(bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, toTime: Date, reqConfig?: RequestConfiguration): Promise<Date[]>;
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
}
export {};
