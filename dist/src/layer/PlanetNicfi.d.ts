import { RequestConfiguration } from '../utils/cancelRequests';
import { WmtsLayer } from './WmtsLayer';
import { BBox } from '../bbox';
interface ConstructorParameters {
    baseUrl?: string;
    layerId?: string;
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
    resourceUrl?: string | null;
}
export declare class PlanetNicfiLayer extends WmtsLayer {
    protected baseUrl: string;
    protected layerId: string;
    protected resourceUrl: string;
    protected matrixSet: string;
    constructor({ baseUrl, layerId, title, description, legendUrl, resourceUrl, }: ConstructorParameters);
    findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date, reqConfig?: RequestConfiguration): Promise<Date[]>;
    private getLayerType;
}
export {};
