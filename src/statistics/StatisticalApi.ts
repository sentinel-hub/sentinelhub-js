import axios, { AxiosRequestConfig } from 'axios';
import { RequestConfiguration } from '..';
import { getAuthToken } from '../auth';
import { DailyChannelStats, GetStatsParams, Stats } from '../layer/const';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getAxiosReqParams } from '../utils/cancelRequests';
import { StatisticsProvider } from './StatisticsProvider';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import {
  createAggregationPayload,
  createCalculationsPayload,
  createInputPayload,
} from './StatisticalApiPayload';

const STATS_DEFAULT_OUTPUT = 'default';

export class StatisticalApi implements StatisticsProvider {
  private convertToFISResponse(response: any, defaultOutput: string): Stats {
    if (response && response.status !== 'OK') {
      throw new Error('Unable to get statistics');
    }
    //array of stats objects (interval+outputs)
    const { data } = response;
    const statisticsPerBand = new Map<string, DailyChannelStats[]>();

    for (let statObject of data) {
      const date = new Date(statObject.interval.from);
      const { outputs } = statObject;
      const outputId = Object.keys(outputs).find(output => output === defaultOutput) || outputs[0];
      const outputData = outputs[outputId];
      const { bands } = outputData;

      Object.keys(bands).forEach(band => {
        const { stats } = bands[band];

        const dailyStats: DailyChannelStats = {
          date: date,
          basicStats: stats,
        };
        // bring your own histogram
        // statistical api doesn't support equal frequency histograms so we try to
        // create them from percentiles

        if (!!stats.percentiles) {
          const lowEdges = Object.keys(stats.percentiles).sort((a, b) => parseFloat(a) - parseFloat(b));
          const bins = [
            parseFloat(stats.min),
            ...lowEdges.map(lowEdge => parseFloat(stats.percentiles[lowEdge])),
          ].map(value => ({ lowEdge: value, mean: null, count: null }));

          dailyStats.histogram = {
            bins: bins,
          };
        }

        //remove percentiles from basic stats
        delete stats.percentiles;

        let dcs: DailyChannelStats[] = [];
        if (statisticsPerBand.has(band)) {
          dcs = statisticsPerBand.get(band);
        }
        dcs.push(dailyStats);
        statisticsPerBand.set(band, dcs);
      });
    }

    const result: Stats = {};

    for (let band of statisticsPerBand.keys()) {
      const bandStats = statisticsPerBand.get(band);
      //bands in FIS response are
      // - prefixed with C
      // - sorted descending
      result[band.replace('B', 'C')] = bandStats.sort((a, b) => b.date.valueOf() - a.date.valueOf());
    }

    return result;
  }

  public async getStats(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    reqConfig?: RequestConfiguration,
  ): Promise<Stats> {
    return this.getBasicStats(layer, params, STATS_DEFAULT_OUTPUT, reqConfig);
  }

  public async getBasicStats(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    output: string,
    reqConfig?: RequestConfiguration,
  ): Promise<Stats> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to use Statistical API');
    }
    await layer.updateLayerFromServiceIfNeeded(reqConfig);

    const input = await createInputPayload(layer, params, reqConfig);
    const aggregation = createAggregationPayload(layer, { ...params, aggregationInterval: 'P1D' });
    const calculations = createCalculationsPayload(layer, params, output);

    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + authToken,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
    };
    const response = await axios.post(
      `${layer.getShServiceHostname()}api/v1/statistics`,
      {
        input: input,
        aggregation: aggregation,
        calculations: calculations,
      },
      requestConfig,
    );

    return this.convertToFISResponse(response.data, STATS_DEFAULT_OUTPUT);
  }
}
