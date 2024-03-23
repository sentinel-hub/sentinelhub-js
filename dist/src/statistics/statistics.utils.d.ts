import { Stats } from '../layer/const';
import { StatisticalApiInputPayload, StatisticalApiAggregationPayload, StatisticalApiCalculationsPayload, StatisticalApiResponse } from './const';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
declare function convertToFISResponse(data: StatisticalApiResponse, defaultOutput?: string): Stats;
declare function createInputPayload(layer: AbstractSentinelHubV3Layer, params: any, reqConfig: RequestConfiguration): Promise<StatisticalApiInputPayload>;
declare function createAggregationPayload(layer: AbstractSentinelHubV3Layer, params: any): StatisticalApiAggregationPayload;
declare function createCalculationsPayload(layer: AbstractSentinelHubV3Layer, params: any, output?: string): StatisticalApiCalculationsPayload;
export declare const StatisticsUtils: {
    convertToFISResponse: typeof convertToFISResponse;
    createInputPayload: typeof createInputPayload;
    createAggregationPayload: typeof createAggregationPayload;
    createCalculationsPayload: typeof createCalculationsPayload;
};
export {};
