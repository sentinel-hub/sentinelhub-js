import { Polygon, BBox as BBoxTurf, MultiPolygon } from '@turf/helpers';
import { ProcessingPayloadDatasource } from '../layer/processing';
export declare type StatisticalApiInputPayload = {
    bounds: {
        bbox?: BBoxTurf;
        geometry?: Polygon | MultiPolygon;
        properties: {
            crs: string;
        };
    };
    data: ProcessingPayloadDatasource[];
};
export declare type StatisticalApiAggregationPayload = {
    timeRange: {
        from: string;
        to: string;
    };
    aggregationInterval: {
        of: string;
    };
    width?: number;
    height?: number;
    resx?: number;
    resy?: number;
    evalscript: string;
};
export declare type StatisticalApiOutput = {
    histograms?: any;
    statistics?: any;
};
export declare type StatisticalApiCalculationsPayload = {
    [output: string]: StatisticalApiOutput;
};
export declare type StatisticalApiPayload = {
    input: StatisticalApiInputPayload;
    aggregation: StatisticalApiAggregationPayload;
    calculations: StatisticalApiCalculationsPayload;
};
declare type StatisticalApiResponseError = 'BAD_REQUEST' | 'EXECUTION_ERROR' | 'TIMEOUT';
declare type StatisticalApiResponseInterval = {
    from: string;
    to: string;
};
export declare type BandHistogram = {
    overflow: number;
    underflow: number;
    bins: {
        lowEdge: number;
        mean: number;
        count: number;
    }[];
};
export declare type BandStats = {
    min: number;
    max: number;
    mean: number;
    stDev: number;
    sampleCount: number;
    noDataCount: number;
    percentiles?: {
        [percentile: string]: number;
    };
};
declare type BandsType = {
    [band: string]: {
        stats: BandStats;
        histogram?: BandHistogram;
    };
};
export declare type StatisticalApiResponse = {
    interval: StatisticalApiResponseInterval;
    outputs: {
        [output: string]: {
            bands: BandsType;
        };
    };
    error?: StatisticalApiResponseError;
}[];
export {};
