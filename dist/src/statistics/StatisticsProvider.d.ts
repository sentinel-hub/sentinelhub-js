import { AbstractLayer } from '../layer/AbstractLayer';
import { GetStatsParams, Stats } from '../layer/const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticalApiPayload, StatisticalApiResponse } from './const';
export declare enum StatisticsProviderType {
    FIS = "FIS",
    STAPI = "STAPI"
}
export interface StatisticsProvider {
    getStats(layer: AbstractLayer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats>;
    getStatistics(shServiceHostname: string, payload: StatisticalApiPayload, reqConfig?: RequestConfiguration): Promise<StatisticalApiResponse>;
}
export declare function getStatisticsProvider(statsProvider: StatisticsProviderType): StatisticsProvider;
