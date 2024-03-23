import { Polygon, BBox as BBoxTurf, MultiPolygon } from '@turf/helpers';
import { MimeType, GetMapParams, Interpolator, PreviewMode, MosaickingOrder, DataProductId } from './const';
import { Dataset } from './dataset';
import { RequestConfiguration } from '../utils/cancelRequests';
declare enum PreviewModeString {
    DETAIL = "DETAIL",
    PREVIEW = "PREVIEW",
    EXTENDED_PREVIEW = "EXTENDED_PREVIEW"
}
declare type DataProduct = {
    '@id': DataProductId;
};
export declare type ProcessingPayload = {
    input: {
        bounds: {
            bbox?: BBoxTurf;
            geometry?: Polygon | MultiPolygon;
            properties: {
                crs: string;
            };
        };
        data: ProcessingPayloadDatasource[];
    };
    output: {
        width: number;
        height: number;
        responses: [{
            identifier: string;
            format: {
                type: MimeType;
            };
        }];
    };
    evalscript?: string;
    dataProduct?: DataProduct;
};
export declare type ProcessingPayloadDatasource = {
    id?: string;
    dataFilter: {
        timeRange: {
            from: string;
            to: string;
        };
        previewMode?: PreviewModeString;
        mosaickingOrder?: MosaickingOrder;
        [key: string]: any;
    };
    processing?: {
        upsampling?: Interpolator;
        downsampling?: Interpolator;
        [key: string]: any;
    };
    type: string;
};
export declare function convertPreviewToString(preview: PreviewMode): PreviewModeString;
export declare function createProcessingPayload(dataset: Dataset, params: GetMapParams, evalscript?: string | null, dataProduct?: DataProductId | null, mosaickingOrder?: MosaickingOrder | null, upsampling?: Interpolator | null, downsampling?: Interpolator | null): ProcessingPayload;
export declare function processingGetMap(shServiceHostname: string, payload: ProcessingPayload, reqConfig: RequestConfiguration): Promise<Blob>;
export {};
