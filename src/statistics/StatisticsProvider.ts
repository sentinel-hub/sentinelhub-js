import { AbstractLayer } from '../layer/AbstractLayer';
import { GetStatsParams, Stats } from '../layer/const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { StatisticsProviderType } from './const';
import { Fis } from './Fis';
import { StatisticalApi } from './StatisticalApi';

export interface StatisticsProvider {
  getStats(layer: AbstractLayer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats>;
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
