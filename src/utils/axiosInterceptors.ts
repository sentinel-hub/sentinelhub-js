import axios, { AxiosRequestConfig, CancelToken, AxiosError } from 'axios';

import { isDebugEnabled } from './debug';
import {
  fetchCachedResponse,
  saveCacheResponse,
  CacheConfig,
  removeCacheableRequestsInProgress,
  deleteExpiredCachedItemsAtInterval,
} from './cacheHandlers';

const DEFAULT_RETRY_DELAY = 3000;
const DEFAULT_MAX_RETRIES = 2;

// we are extending axios' AxiosRequestConfig:
// https://stackoverflow.com/questions/58777924/axios-typescript-customize-axiosrequestconfig
declare module 'axios' {
  export interface AxiosRequestConfig {
    retries?: number;
    cancelToken?: CancelToken;
    cacheKey?: string;
    cache?: CacheConfig;
    rewriteUrlFunc?: (url: string) => string;
    setCancelTokenCacheKey?: (cacheKey: string) => void;
  }
}

export const registerInitialAxiosInterceptors = (): any => {
  deleteExpiredCachedItemsAtInterval();
  // - the interceptors are called in reverse order in which they are registered - last
  //   defined interceptor is called first
  // - some interceptors might also be added in other places (`registerHostnameReplacing()`)
  axios.interceptors.request.use(logCurl, error => Promise.reject(error));
  axios.interceptors.request.use(fetchCachedResponse, error => Promise.reject(error));
  axios.interceptors.request.use(rewriteUrl, error => Promise.reject(error));
  axios.interceptors.response.use(saveCacheResponse, error => retryRequests(error));
};

const rewriteUrl = async (config: any): Promise<any> => {
  if (config.rewriteUrlFunc) {
    config.url = config.rewriteUrlFunc(config.url);
  }
  return config;
};

const logCurl = async (config: any): Promise<any> => {
  if (isDebugEnabled()) {
    // Headers are not represented in a very straighforward way in axios, so we must transform
    // them. This is the contents of axios' config.headers:
    //   {
    //     common: { Accept: 'application/json, text/plain, */*' },
    //     delete: {},
    //     get: {},
    //     head: {},
    //     post: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //     put: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //     patch: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //     Authorization: 'Bearer eyJra...'
    //   },
    let headers = {
      ...config.headers.common,
      ...config.headers[config.method],
    };
    const addedHeadersKeys = Object.keys(config.headers).filter(k => typeof config.headers[k] === 'string');
    addedHeadersKeys.forEach(k => (headers[k] = config.headers[k]));

    // findDatesUTC on S1GRDAWSEULayer doesn't specify JSON Content-Type, but the request still works as if it was specified. On
    // the other hand, when requesting auth token, we use Content-Type 'application/x-www-form-urlencoded'. This hack updates a
    // Content-Type header to JSON whenever data is not a string:
    if (typeof config.data !== 'string') {
      headers['Content-Type'] = 'application/json';
    }

    // we sometimes get both 'Content-Type' and 'content-type', making /oauth/token/ endpoint complain
    let lowercaseHeaders: Record<string, string> = {};
    for (let k in headers) {
      lowercaseHeaders[k.toLowerCase()] = headers[k];
    }

    console.debug(
      `${'*'.repeat(30)}\n${curlify(
        config.url,
        config.method.toUpperCase(),
        config.data,
        lowercaseHeaders,
      )}\n\n`,
    );
  }
  return config;
};

function curlify(
  url: string,
  method: string,
  payload: any | null = null,
  headers: Record<string, string> = {},
): string {
  let curl = `curl -X ${method} '${url}'`;
  for (let h in headers) {
    curl += ` -H '${h}: ${headers[h]}'`;
  }
  if (payload) {
    curl += ` -d '${typeof payload === 'string' ? payload : JSON.stringify(payload)}'`;
  }
  return curl;
}

const retryRequests = (err: any): any => {
  if (!err.config) {
    return Promise.reject(err);
  }

  if (err.config.cacheKey) {
    removeCacheableRequestsInProgress(err.config.cacheKey);
  }

  if (shouldRetry(err)) {
    err.config.retriesCount = err.config.retriesCount | 0;
    const maxRetries =
      err.config.retries === undefined || err.config.retries === null
        ? DEFAULT_MAX_RETRIES
        : err.config.retries;
    const shouldRetry = err.config.retriesCount < maxRetries;
    if (shouldRetry) {
      err.config.retriesCount += 1;
      return new Promise(resolve => setTimeout(() => resolve(axios(err.config)), DEFAULT_RETRY_DELAY));
    }
  }

  return Promise.reject(err);
};

const shouldRetry = (error: AxiosError): boolean => {
  // error.response is not always defined, as the error could be thrown before we get a response from the server
  // https://github.com/axios/axios/issues/960#issuecomment-398269712
  if (!error.response || !error.response.status) {
    return false;
  }
  return error.response.status == 429 || (error.response.status >= 500 && error.response.status <= 599);
};
