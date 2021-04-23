import { AbstractLayer } from '../layer/AbstractLayer';
import { GetStatsParams, Stats } from '../layer/const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { Fis } from './Fis';

export enum StatsProvider {
  FIS = 'FIS',
  STAPI = 'STAPI',
}

export interface StatisticsProvider {
  getStats(layer: AbstractLayer, params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats>;
}

export function getStatisticsProvider(statsProvider: StatsProvider): StatisticsProvider {
  switch (statsProvider) {
    case StatsProvider.STAPI:
      throw new Error(`Not supported yet `);
    case StatsProvider.FIS:
      return new Fis();
    default:
      throw new Error(`Unknows statistics provider ${statsProvider}`);
  }
}
