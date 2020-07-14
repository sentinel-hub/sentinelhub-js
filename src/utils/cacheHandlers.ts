import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'query-string';

export const DEFAULT_CACHE_CONFIG = { expiresIn: 1800 };
const SENTINEL_HUB_CACHE = 'sentinelhub-v1';
const EXPIRY_HEADER_KEY = 'Cache_Expires';

export type CacheConfig = {
  expiresIn: number;
};

export const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!isRequestCachable(request)) {
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

export const saveCacheResponse = async (response: AxiosResponse): Promise<any> => {
  // not using cache?
  if (!isRequestCachable(response.config)) {
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
  const expiresMs = new Date().getTime() + response.config.cache.expiresIn * 1000;
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

const cacheStillValid = (response: Response): boolean => {
  if (!response) {
    return true;
  }
  const now = new Date();
  const expirationDate = Number(response.headers.get(EXPIRY_HEADER_KEY));
  return expirationDate > now.getTime();
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

export const findAndDeleteExpiredCachedItems = async (): Promise<void> => {
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

const isRequestCachable = (request: AxiosRequestConfig): boolean => {
  if (!(request && request.cache && request.cache.expiresIn)) {
    return false;
  }
  // cache can be disbabled with expiresIn: 0;
  if (request.cache.expiresIn === 0) {
    return false;
  }

  return true;
};
