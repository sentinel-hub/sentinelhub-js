import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'query-string';
import { CacheTargets, cacheFactory, SUPPORTED_TARGETS } from './Cache';

export const CACHE_CONFIG_30MIN = { expiresIn: 1800 };
export const CACHE_CONFIG_NOCACHE = { expiresIn: 0 };
export const EXPIRY_HEADER_KEY = 'cache_expires';

export type CacheConfig = {
  expiresIn: number;
  targets?: CacheTargets;
};

export const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!isRequestCachable(request)) {
    return request;
  }

  const cacheKey = await generateCacheKey(request);
  // resource not cacheable? It couldn't have been saved to cache:
  if (cacheKey === null) {
    return request;
  }
  const shCache = cacheFactory(request.cache.targets);
  if (!shCache) {
    return request;
  }
  const cachedResponse = await shCache.get(cacheKey, request.responseType);
  if (!cachedResponse || !cacheStillValid(cachedResponse.headers)) {
    request.cacheKey = cacheKey;
    return request;
  }

  // serve from cache:
  request.adapter = async () => {
    return Promise.resolve({
      data: cachedResponse.data,
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
  // resource not cacheable?
  if (!response.config.cacheKey) {
    return response;
  }
  const shCache = cacheFactory(response.config.cache.targets);
  if (!shCache) {
    return response;
  }
  if (await shCache.has(response.config.cacheKey)) {
    return response;
  }

  // before saving response, set an artificial header that tells when it should expire:
  const expiresMs = new Date().getTime() + response.config.cache.expiresIn * 1000;
  response.headers = {
    ...response.headers,
    [EXPIRY_HEADER_KEY]: expiresMs,
  };
  shCache.set(response.config.cacheKey, response);
  return response;
};

const cacheStillValid = (headers: Record<string, any>): boolean => {
  if (!headers) {
    return true;
  }
  const now = new Date();
  const expirationDate = Number(headers[EXPIRY_HEADER_KEY]);
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
  for (const target of SUPPORTED_TARGETS) {
    const shCache = cacheFactory([target]);
    if (!shCache) {
      continue;
    }
    const cacheKeys = await shCache.keys();
    cacheKeys.forEach(async key => {
      const headers = await shCache.getHeaders(key);
      if (!cacheStillValid(headers)) {
        await shCache.delete(key);
      }
    });
  }
};

const isRequestCachable = (request: AxiosRequestConfig): boolean => {
  if (!(request && request.cache && request.cache.expiresIn)) {
    return false;
  }
  // cache can be disabled with expiresIn: 0;
  if (request.cache.expiresIn === 0) {
    return false;
  }

  return true;
};
