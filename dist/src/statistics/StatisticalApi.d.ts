import { RequestConfiguration } from '..';
import { GetStatsParams } from '../layer/const';
import { StatisticsProvider } from './StatisticsProvider';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { StatisticalApiResponse, StatisticalApiPayload } from './const';
export declare class StatisticalApi implements StatisticsProvider {
    getStats(layer: AbstractSentinelHubV3Layer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<StatisticalApiResponse>;
    getStatistics(shServiceHostname: string, payload: StatisticalApiPayload, reqConfig?: RequestConfiguration): Promise<StatisticalApiResponse>;
}
