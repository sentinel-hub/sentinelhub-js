import { GetMapParams } from './const';
export declare enum ServiceType {
    WMS = "WMS",
    WCS = "WCS",
    WFS = "WFS"
}
export declare function wmsGetMapUrl(baseUrl: string, layers: string, params: GetMapParams, evalscript?: string | null, evalscriptUrl?: string | null, evalsource?: string | null, additionalParameters?: Record<string, any>): string;
