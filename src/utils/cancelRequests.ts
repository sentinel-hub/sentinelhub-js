import axios, { CancelTokenSource, AxiosRequestConfig, CancelToken as CancelTokenAxios } from 'axios';
import { CacheConfig } from './cacheHandlers';

export type RequestConfiguration = {
  authToken?: string | null;
  retries?: number;
  timeout?: number | null;
  cancelToken?: CancelToken;
  cache?: CacheConfig;
};

export class CancelToken {
  protected token: CancelTokenAxios | null = null;
  protected source: CancelTokenSource | null = null;
  public constructor() {
    this.source = axios.CancelToken.source();
    this.token = this.source.token;
  }

  public cancel(): void {
    this.source.cancel();
  }

  public getToken(): CancelTokenAxios {
    return this.token;
  }
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};

export const getAxiosReqParams = (
  reqConfig: RequestConfiguration,
  defaultCache: CacheConfig,
): AxiosRequestConfig => {
  let axiosReqConfig: AxiosRequestConfig = {
    cache: defaultCache,
  };

  if (!reqConfig) {
    return axiosReqConfig;
  }

  if (reqConfig.cancelToken) {
    axiosReqConfig.cancelToken = reqConfig.cancelToken.getToken();
  }
  axiosReqConfig.retries = reqConfig.retries;
  if (reqConfig.cache) {
    axiosReqConfig.cache = reqConfig.cache;
  }
  return axiosReqConfig;
};
