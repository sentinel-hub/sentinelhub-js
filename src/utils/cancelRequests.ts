import axios, {
  CancelTokenSource,
  AxiosRequestConfig,
  CancelToken as CancelTokenAxios,
  ResponseType,
} from 'axios';
import { CacheConfig, removeCacheableRequestsInProgress } from './cacheHandlers';
import { getDefaultRequestsConfig } from './defaultReqsConfig';

export type RequestConfiguration = {
  authToken?: string | null;
  retries?: number;
  timeout?: number | null;
  cancelToken?: CancelToken;
  cache?: CacheConfig;
  responseType?: ResponseType;
  rewriteUrlFunc?: (url: string) => string;
};

export class CancelToken {
  protected token: CancelTokenAxios | null = null;
  protected source: CancelTokenSource | null = null;
  //list of all request that can be cancelled by token instance
  protected cacheKeys: Set<string> = new Set();

  public constructor() {
    this.source = axios.CancelToken.source();
    this.token = this.source.token;
  }

  public setCancelTokenCacheKey(cacheKey: string): void {
    this.cacheKeys.add(cacheKey);
  }

  public cancel(): void {
    if (this.cacheKeys.size > 0) {
      for (let cacheKey of this.cacheKeys) {
        removeCacheableRequestsInProgress(cacheKey);
      }
      this.cacheKeys.clear();
    }
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

  const reqConfigWithDefault = {
    ...getDefaultRequestsConfig(),
    ...reqConfig,
  };

  if (reqConfigWithDefault.cancelToken) {
    axiosReqConfig.setCancelTokenCacheKey = (cacheKey: string): void =>
      reqConfigWithDefault.cancelToken.setCancelTokenCacheKey(cacheKey);
    axiosReqConfig.cancelToken = reqConfigWithDefault.cancelToken.getToken();
  }
  if (reqConfigWithDefault.retries !== null && reqConfigWithDefault.retries !== undefined) {
    axiosReqConfig.retries = reqConfigWithDefault.retries;
  }
  if (reqConfigWithDefault.cache) {
    axiosReqConfig.cache = reqConfigWithDefault.cache;
  }
  if (reqConfigWithDefault.rewriteUrlFunc) {
    axiosReqConfig.rewriteUrlFunc = reqConfigWithDefault.rewriteUrlFunc;
  }
  if (reqConfigWithDefault.responseType) {
    axiosReqConfig.responseType = reqConfigWithDefault.responseType;
  }
  return axiosReqConfig;
};
