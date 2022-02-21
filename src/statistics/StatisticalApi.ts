import axios, { AxiosRequestConfig } from 'axios';
import { RequestConfiguration } from '..';
import { getAuthToken } from '../auth';
import { GetStatsParams } from '../layer/const';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getAxiosReqParams } from '../utils/cancelRequests';
import { StatisticsProvider } from './StatisticsProvider';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { StatisticsUtils } from './statistics.utils';

import { StatisticalApiResponse, StatisticalApiPayload } from './const';

const STATS_DEFAULT_OUTPUT = 'default';

export class StatisticalApi implements StatisticsProvider {
  public async getStats(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    reqConfig?: RequestConfiguration,
  ): Promise<StatisticalApiResponse> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to use Statistical API');
    }

    await layer.updateLayerFromServiceIfNeeded(reqConfig);

    const input = await StatisticsUtils.createInputPayload(layer, params, reqConfig);
    const aggregation = StatisticsUtils.createAggregationPayload(layer, {
      ...params,
      aggregationInterval: 'P1D',
    });
    const calculations = StatisticsUtils.createCalculationsPayload(
      layer,
      params,
      params?.output || STATS_DEFAULT_OUTPUT,
    );

    const payload: StatisticalApiPayload = {
      input: input,
      aggregation: aggregation,
      calculations: calculations,
    };

    const data = this.getStatistics(`${layer.getShServiceHostname()}api/v1/statistics`, payload, reqConfig);

    return data;
  }

  public async getStatistics(
    shServiceHostname: string,
    payload: StatisticalApiPayload,
    reqConfig?: RequestConfiguration,
  ): Promise<StatisticalApiResponse> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to use Statistical API');
    }

    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + authToken,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
    };

    const response = await axios.post(shServiceHostname, payload, requestConfig);

    if (response.status !== 200) {
      throw new Error('Unable to get statistics');
    }

    return response.data;
  }
}
