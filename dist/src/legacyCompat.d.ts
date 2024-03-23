import { ApiType, GetMapParams, OverrideGetMapParams } from './layer/const';
import { RequestConfiguration } from './utils/cancelRequests';
export declare function legacyGetMapFromUrl(urlWithQueryParams: string, api?: ApiType, fallbackToWmsApi?: boolean, overrideLayerConstructorParams?: Record<string, any>, overrideGetMapParams?: OverrideGetMapParams): Promise<Blob>;
export declare function legacyGetMapWmsUrlFromParams(baseUrl: string, wmsParams: Record<string, any>): string;
export declare function legacyGetMapFromParams(baseUrl: string, wmsParams: Record<string, any>, api?: ApiType, fallbackToWmsApi?: boolean, overrideLayerConstructorParams?: Record<string, any>, overrideGetMapParams?: OverrideGetMapParams, requestConfig?: RequestConfiguration, preferGetCapabilities?: boolean): Promise<Blob>;
declare type ParsedLegacyWmsGetMapParams = {
    layers: string;
    evalscript: string | null;
    evalscriptUrl: string | null;
    evalsource: string | null;
    getMapParams: GetMapParams;
    otherLayerParams: Record<string, any>;
};
export declare function parseLegacyWmsGetMapParams(wmsParams: Record<string, any>): ParsedLegacyWmsGetMapParams;
export {};
