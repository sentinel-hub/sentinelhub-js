import axios, { AxiosRequestConfig, CancelToken, AxiosError } from 'axios';
import { stringify } from 'query-string';

import { isDebugEnabled } from 'src/utils/debug';

const SENTINEL_HUB_CACHE = 'sentinelhub-v1';
const EXPIRY_HEADER_KEY = 'Cache_Expires';
const DEFAULT_RETRY_DELAY = 3000;
const DEFAULT_MAX_RETRIES = 2;

// we are extending axios' AxiosRequestConfig:
// https://stackoverflow.com/questions/58777924/axios-typescript-customize-axiosrequestconfig
declare module 'axios' {
  export interface AxiosRequestConfig {
    retries?: number;
    cancelToken?: CancelToken;
    cacheKey?: string;
    expiresIn?: number;
  }
}

export const registerAxiosCacheRetryInterceptors = (): any => {
  findAndDeleteExpiredCachedItems();
  axios.interceptors.request.use(logCurl, error => Promise.reject(error));
  axios.interceptors.request.use(fetchCachedResponse, error => Promise.reject(error));
  axios.interceptors.response.use(saveCacheResponse, error => retryRequests(error));
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

const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!(request && request.expiresIn)) {
    return request;
  }

  // do not perform caching if Cache API is not supported:
  if (typeof window === 'undefined' || !window.caches) {
    return request;
  }
  const cacheKey = await generateCacheKey(request);
  // resource not cacheable? It couldn't have been saved to cache:
  if (cacheKey === null) {
    return request;
  }

  let cache;
  try {
    cache = await caches.open(SENTINEL_HUB_CACHE);
  } catch (err) {
    console.warn('Caching failed', err);
    return request;
  }

  const cachedResponse = await cache.match(cacheKey);
  if (!cachedResponse || !cacheStillValid(cachedResponse)) {
    request.cacheKey = cacheKey;
    return request;
  }

  // serve from cache:
  request.adapter = async () => {
    // when we get data (Response) from cache (Cache API), we want to return it in the
    // same form as the original axios request (without cache) would, so we convert it
    // appropriately:
    let responseData;
    switch (request.responseType) {
      case 'blob':
        responseData = await cachedResponse.blob();
        break;
      case 'arraybuffer':
        responseData = await cachedResponse.arrayBuffer();
        break;
      case 'text':
        responseData = await cachedResponse.text();
        break;
      case 'json':
      case undefined: // axios defaults to json https://github.com/axios/axios#request-config
        responseData = await cachedResponse.json();
        break;
      default:
        throw new Error('Unsupported response type: ' + request.responseType);
    }

    return Promise.resolve({
      data: responseData,
      headers: request.headers,
      request: request,
      config: request,
      responseType: request.responseType,
    });
  };

  return request;
};

const saveCacheResponse = async (response: any): Promise<any> => {
  // not using cache?
  if (!response.config.expiresIn) {
    return response;
  }
  // do not perform caching if Cache API is not supported:
  if (typeof window === 'undefined' || !window.caches) {
    return response;
  }
  // resource not cacheable?
  if (!response.config.cacheKey) {
    return response;
  }
  let cache;
  try {
    cache = await caches.open(SENTINEL_HUB_CACHE);
  } catch (err) {
    console.warn('Caching failed', err);
    return response;
  }

  // before saving response, set an artificial header that tells when it should expire:
  const expiresMs = new Date().getTime() + response.config.expiresIn * 1000;
  response.headers = {
    ...response.headers,
    [EXPIRY_HEADER_KEY]: expiresMs,
  };

  const request = response.config;
  // axios has already converted the response data according to responseType, which means that for example with
  // json, we have an object. We must convert data back to original form before saving to cache:
  let responseData;
  switch (request.responseType) {
    case 'blob':
    case 'arraybuffer':
    case 'text':
      // we can save usual responses as they are:
      responseData = response.data;
      break;
    case 'json':
    case undefined: // axios defaults to json https://github.com/axios/axios#request-config
      // but json was converted by axios to an object - and we want to save a string:
      responseData = JSON.stringify(response.data);
      break;
    default:
      throw new Error('Unsupported response type: ' + request.responseType);
  }
  cache.put(response.config.cacheKey, new Response(responseData, response));
  return response;
};

const retryRequests = (err: any): any => {
  if (!err.config) {
    return Promise.reject(err);
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

const generateCacheKey = async (request: AxiosRequestConfig): Promise<string | null> => {
  switch (request.method) {
    // post requests are not supported, so we mimic a get request, by formatting the body/params to sha256, and constructing a key/url
    // idea taken from https://blog.cloudflare.com/introducing-the-workers-cache-api-giving-you-control-over-how-your-content-is-cached/
    case 'post':
      const body = JSON.stringify(request.data);
      const hash = await stringToHash(body);
      return `${request.url}?${hash}`;
    case 'get':
      return `${request.url}?${stringify(request.params)}`;
    default:
      return null;
  }
};

//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const stringToHash = async (message: string): Promise<any> => {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    let chr = message.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const shouldRetry = (error: AxiosError): boolean => {
  // error.response is not always defined, as the error could be thrown before we get a response from the server
  // https://github.com/axios/axios/issues/960#issuecomment-398269712
  if (!error.response || !error.response.status) {
    return false;
  }
  return error.response.status >= 500 && error.response.status <= 599;
};

const cacheStillValid = (response: Response): boolean => {
  if (!response) {
    return true;
  }
  const now = new Date();
  const expirationDate = Number(response.headers.get(EXPIRY_HEADER_KEY));
  return expirationDate > now.getTime();
};

const findAndDeleteExpiredCachedItems = async (): Promise<void> => {
  let cache: Cache;
  try {
    cache = await caches.open(SENTINEL_HUB_CACHE);
  } catch (err) {
    return; // when running tests, `caches` is not defined
  }

  const cacheKeys = await cache.keys();
  cacheKeys.forEach(async key => {
    const cachedResponse = await cache.match(key);
    if (!cacheStillValid(cachedResponse)) {
      cache.delete(key);
    }
  });
};
