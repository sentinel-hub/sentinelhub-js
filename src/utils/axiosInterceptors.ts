import axios, { AxiosRequestConfig } from 'axios';
import { stringify } from 'query-string';

const SENTINEL_HUB_CACHE = 'sentinelhub-v1';
const EXPIRY_HEADER_KEY = 'Cache_Expires';
const EXPIRES_IN_SECONDS = 60 * 30;
const DELAY = 3000;
const RETRIES = 5;

// we are extending axios' AxiosRequestConfig:
// https://stackoverflow.com/questions/58777924/axios-typescript-customize-axiosrequestconfig
declare module 'axios' {
  export interface AxiosRequestConfig {
    useCache?: boolean;
    retries?: number;
  }
}

export const registerAxiosCacheRetryInterceptors = (): any => {
  findAndDeleteExpiredCachedItems();
  axios.interceptors.request.use(fetchCachedResponse, error => Promise.reject(error));
  axios.interceptors.response.use(saveCacheResponse, error => retryRequests(error));
};

const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!(request && request.useCache)) {
    return request;
  }

  const cacheKey = await generateCacheKey(request);
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
    return request;
  }

  // serve from cache:
  request.adapter = async () => {
    // response from cache api follows the same structure as the fetch api, hence this hack
    // could be better if the caller handles the response (response.blob) instead of the caching function?
    let responseData;
    switch (request.responseType) {
      case 'blob':
        responseData = await cachedResponse.blob();
        break;
      case 'text':
        responseData = await cachedResponse.text();
        break;
      case 'json':
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
      isFromCache: true,
    });
  };

  return request;
};

const saveCacheResponse = async (response: any): Promise<any> => {
  // not using cache?
  if (!response.config.useCache) {
    return response;
  }
  // if we are serving from cache, there is no need to save the response to cache: (it came from there)
  if (response.isFromCache) {
    return response;
  }
  // resource not cacheable?
  const cacheKey = await generateCacheKey(response.config);
  if (cacheKey === null) {
    return response;
  }
  // Cache API not supported?
  let cache;
  try {
    cache = await caches.open(SENTINEL_HUB_CACHE);
  } catch (err) {
    console.debug('Cache API not supported, not caching', err);
    return response;
  }

  // before saving response, set an artificial header that tells when it should expire:
  const expiresMs = new Date().getTime() + EXPIRES_IN_SECONDS * 1000;
  response.headers = {
    ...response.headers,
    [EXPIRY_HEADER_KEY]: expiresMs,
  };

  const hasCache = await cache.match(cacheKey);
  if (!hasCache) {
    cache.put(cacheKey, new Response(response.data, response));
  }
  return response;
};

const retryRequests = (err: any): any => {
  if (!err.config) {
    return Promise.reject(err);
  }
  if (shouldRetry(err.response.status)) {
    err.config.retriesCount = err.config.retriesCount | 0;
    const shouldRetry = err.config.retriesCount < RETRIES;
    if (shouldRetry) {
      err.config.retriesCount += 1;
      return new Promise(resolve => setTimeout(() => resolve(axios(err.config)), DELAY));
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
      const hash = await sha256(body);
      return `${request.url}?${hash}`;
    case 'get':
      return `${request.url}?${stringify(request.params)}`;
    default:
      return null;
  }
};

//https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
// example from https://blog.cloudflare.com/introducing-the-workers-cache-api-giving-you-control-over-how-your-content-is-cached/
const sha256 = async (message: any): Promise<any> => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
};

const shouldRetry = (errorStatus: number): boolean => errorStatus >= 500 && errorStatus <= 599;

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
