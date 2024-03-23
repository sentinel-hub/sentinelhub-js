import { GetMapParams, ApiType } from './const';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { TileMatrix } from './wmts.utils';
interface ConstructorParameters {
    baseUrl?: string;
    layerId?: string;
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
    resourceUrl?: string | null;
    matrixSet?: string | null;
}
export declare class WmtsLayer extends AbstractLayer {
    protected baseUrl: string;
    protected layerId: string;
    protected resourceUrl: string;
    protected matrixSet: string;
    protected tileMatrix: TileMatrix[];
    constructor({ baseUrl, layerId, title, description, legendUrl, resourceUrl, matrixSet, }: ConstructorParameters);
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    getMapUrl(params: GetMapParams, api: ApiType): string;
    protected stitchGetMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<any>;
    supportsApiType(api: ApiType): boolean;
}
export {};
