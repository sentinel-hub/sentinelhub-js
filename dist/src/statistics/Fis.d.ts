import { RequestConfiguration } from '../utils/cancelRequests';
import { AbstractLayer } from '../layer/AbstractLayer';
import { FisResponse, GetStatsParams } from '../layer/const';
import { StatisticsProvider } from './StatisticsProvider';
import { StatisticalApiResponse } from './const';
export declare class Fis implements StatisticsProvider {
    getStatistics(): Promise<StatisticalApiResponse>;
    private createFISPayload;
    private convertFISResponse;
    getStats(layer: AbstractLayer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<FisResponse>;
    private handleV3;
    private handleV1orV2;
}
