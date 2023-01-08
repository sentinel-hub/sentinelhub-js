import { BBox } from '../../index';
export declare function constructFixtureGetMapRequest({ bbox, width, height, format, evalscript, data, }: {
    bbox?: BBox;
    width?: number;
    height?: number;
    format?: "application/json" | "text/xml" | "image/png" | "image/jpeg" | "image/tiff" | "image/tiff;depth=8" | "image/tiff;depth=16" | "image/tiff;depth=32f" | "JPEG_OR_PNG";
    evalscript?: string;
    data?: any[];
}): Record<any, any>;
