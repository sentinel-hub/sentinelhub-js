import axios, { AxiosRequestConfig } from 'axios';
import { RequestConfiguration } from '..';
import { getAuthToken } from '../auth';
import { GetStatsParams } from '../layer/const';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getAxiosReqParams } from '../utils/cancelRequests';
import { StatisticsProvider } from './StatisticsProvider';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import {
  createAggregationPayload,
  createCalculationsPayload,
  createInputPayload,
} from './StatisticalApiPayload';

import { StatisticalApiResponse } from './StatisticalApiTypes';

const STATS_DEFAULT_OUTPUT = 'default';

export class StatisticalApi implements StatisticsProvider {
  public async getStats(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    reqConfig?: RequestConfiguration,
  ): Promise<StatisticalApiResponse> {
    return this.getBasicStats(layer, params, params?.output || STATS_DEFAULT_OUTPUT, reqConfig);
  }

  public async getBasicStats(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    output: string,
    reqConfig?: RequestConfiguration,
  ): Promise<StatisticalApiResponse> {
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

    if (response.status !== 200) {
      throw new Error('Unable to get statistics');
    }

    return response.data;
  }
}
