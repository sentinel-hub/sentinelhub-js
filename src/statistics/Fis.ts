import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import WKT from 'terraformer-wkt-parser';
import { CRS_EPSG4326, CRS_WGS84, findCrsFromUrn } from '../crs';
import type { AbstractLayer } from '../layer/AbstractLayer';
import type { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { FisPayload, FisResponse, GetStatsParams, HistogramType } from '../layer/const';
import { CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import type { StatisticsProvider } from './StatisticsProvider';

export class Fis implements StatisticsProvider {
  private createFISPayload(layer: AbstractSentinelHubV3Layer, params: GetStatsParams): FisPayload {
    if (!params.geometry) {
      throw new Error('Parameter "geometry" needs to be provided');
    }

    if (!params.resolution) {
      throw new Error('Parameter "resolution" needs to be provided');
    }

    if (!params.fromTime || !params.toTime) {
      throw new Error('Parameters "fromTime" and "toTime" need to be provided');
    }

    const payload: FisPayload = {
      layer: layer.getLayerId(),
      crs: params.crs ? params.crs.authId : CRS_EPSG4326.authId,
      geometry: WKT.convert(params.geometry),
      time: `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${
        moment.utc(params.toTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      }`,
      resolution: undefined,
      bins: params.bins || 5,
      type: HistogramType.EQUALFREQUENCY,
      ...layer.getStatsAdditionalParameters(),
    };

    if (params.geometry.crs) {
      const selectedCrs = findCrsFromUrn(params.geometry.crs.properties.name);
      payload.crs = selectedCrs.authId;
    }

    // When using CRS=EPSG:4326 or CRS_WGS84 one has to add the "m" suffix to enforce resolution in meters per pixel
    if (payload.crs === CRS_EPSG4326.authId || payload.crs === CRS_WGS84.authId) {
      payload.resolution = params.resolution + 'm';
    } else {
      payload.resolution = params.resolution;
    }
    if (layer.getEvalscript()) {
      if (typeof window !== 'undefined' && window.btoa) {
        payload.evalscript = btoa(layer.getEvalscript());
      } else {
        payload.evalscript = Buffer.from(layer.getEvalscript(), 'utf8').toString('base64');
      }
      if ('getEvalsource' in layer && layer.getEvalsource instanceof Function) {
        payload.evalsource = layer.getEvalsource();
      }
    }
    return payload;
  }

  private convertFISResponse(data: any): FisResponse {
    // convert date strings to Date objects
    for (let channel in data) {
      data[channel] = data[channel].map((dailyStats: any) => ({
        ...dailyStats,
        date: new Date(dailyStats.date),
      }));
    }
    return data;
  }

  public async getStats(
    layer: AbstractLayer,
    _params: GetStatsParams,
    reqConfig?: RequestConfiguration,
  ): Promise<FisResponse> {
    return layer.getStats(layer, reqConfig);
  }

  public async handleV3(
    layer: AbstractSentinelHubV3Layer,
    params: GetStatsParams,
    reqConfig?: RequestConfiguration,
  ): Promise<FisResponse> {
    const payload: FisPayload = this.createFISPayload(layer, params);

    const axiosReqConfig: AxiosRequestConfig = {
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE),
    };
    const shServiceHostname = layer.getShServiceHostname();
    const { data } = await axios.post(
      shServiceHostname + 'ogc/fis/' + layer.getInstanceId(),
      payload,
      axiosReqConfig,
    );

    return this.convertFISResponse(data);
  }
}
