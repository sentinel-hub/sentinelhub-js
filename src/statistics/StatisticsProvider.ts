import { AbstractLayer } from '../layer/AbstractLayer';
import { GetStatsParams, Stats } from '../layer/const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticalApiPayload, StatisticalApiResponse } from './const';
import { Fis } from './Fis';
import { StatisticalApi } from './StatisticalApi';

export enum StatisticsProviderType {
  FIS = 'FIS',
  STAPI = 'STAPI',
}

export interface StatisticsProvider {
  getStats(layer: AbstractLayer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats>;
  getStatistics(
    shServiceHostname: string,
    payload: StatisticalApiPayload,
    reqConfig?: RequestConfiguration,
  ): Promise<StatisticalApiResponse>;
}

export function getStatisticsProvider(statsProvider: StatisticsProviderType): StatisticsProvider {
  switch (statsProvider) {
    case StatisticsProviderType.STAPI:
      return new StatisticalApi();
    case StatisticsProviderType.FIS:
      return new Fis();
    default:
      throw new Error(`Unknows statistics provider ${statsProvider}`);
  }
}
