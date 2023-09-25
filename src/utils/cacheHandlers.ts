import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'query-string';
import { CacheTarget, CacheTargets, cacheFactory, SUPPORTED_TARGETS } from './Cache';

export const CACHE_CONFIG_30MIN = { expiresIn: 1800 };
export const CACHE_CONFIG_NOCACHE = { expiresIn: 0 };
export const CACHE_CONFIG_30MIN_MEMORY = {
  targets: [CacheTarget.MEMORY],
  expiresIn: CACHE_CONFIG_30MIN.expiresIn,
};
export const EXPIRY_HEADER_KEY = 'cache_expires';

export type CacheConfig = {
  expiresIn: number;
  targets?: CacheTargets;
};

const CLEAR_CACHE_INTERVAL = 60 * 1000;

// Even though we have caching enabled, if we fire 10 (equal) requests in parallel, they will
// still all be executed - because by the time first response is saved in cache, the other 9
// requests are already made too. To combat this, we save cacheKeys of ongoing requests and
// simply delay new requests with the same cacheKey.
export const cacheableRequestsInProgress = new Set();

export const removeCacheableRequestsInProgress = (cacheKey: string): void => {
  cacheableRequestsInProgress.delete(cacheKey);
};

export const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!isRequestCachable(request)) {
    return request;
  }
  const cacheKey = generateCacheKey(request);
  // resource not cacheable? It couldn't have been saved to cache:
  if (cacheKey === null) {
    return request;
  }

  // When request is cancelled, it must also be removed from list of cacheableRequestsInProgress.
  // In order to remove requests from cacheableRequestsInProgress, cancelToken must be aware of requests(cacheKeys) it is responsible for.
  if (request.cancelToken && request.setCancelTokenCacheKey) {
    request.setCancelTokenCacheKey(cacheKey);
  }

  // there is a request with the same cacheKey in progress - wait until it
  // finishes (we might be able to use its response from cache)
  while (cacheableRequestsInProgress.has(cacheKey)) {
    await sleep(100);
  }

  // it is important that we block any possible parallel requests before we execute
  // our first await, otherwise other requests will step in before we can stop them:
  cacheableRequestsInProgress.add(cacheKey);
  try {
    const shCache = await cacheFactory(request.cache.targets);
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
  } finally {
    // if we have blocked other requests by mistake (we will not be creating a new cache
    // entry from this request), we should fix this now:
    if (!request.cacheKey) {
      removeCacheableRequestsInProgress(cacheKey);
    }
  }
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

  try {
    const shCache = await cacheFactory(response.config.cache.targets);
    if (!shCache) {
      return response;
    }
    if (
      (await shCache.has(response.config.cacheKey)) &&
      cacheStillValid(await shCache.getHeaders(response.config.cacheKey))
    ) {
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
  } finally {
    // if response.config.cacheKey was there, we *must* remove it from the list
    // of requests in progress, otherwise all other requests with the same cacheKey
    // will wait indefinitely:
    removeCacheableRequestsInProgress(response.config.cacheKey);
  }
};

export const cacheStillValid = (headers: Record<string, any>): boolean => {
  if (!headers) {
    return true;
  }
  const now = new Date();
  const expirationDate = Number(headers[EXPIRY_HEADER_KEY]);
  return expirationDate > now.getTime();
};

const generateCacheKey = (request: AxiosRequestConfig): string | null => {
  switch (request.method) {
    // post requests are not supported, so we mimic a get request, by formatting the body/params to sha256, and constructing a key/url
    // idea taken from https://blog.cloudflare.com/introducing-the-workers-cache-api-giving-you-control-over-how-your-content-is-cached/
    case 'post':
      // don't serialize strings or already serialized objects as this will result in escaping some chars and different hash
      const body = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
      const hash = stringToHash(body);
      return `${request.url}?${hash}`;
    case 'get':
      return `${request.url}?${stringify(request.params)}`;
    default:
      return null;
  }
};

//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const stringToHash = (message: string): number => {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    let chr = message.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const deleteExpiredCachedItemsAtInterval = (): void => {
  // delete expired items on initialization
  findAndDeleteExpiredCachedItems();
  setInterval(() => {
    findAndDeleteExpiredCachedItems();
  }, CLEAR_CACHE_INTERVAL);
};

const findAndDeleteExpiredCachedItems = async (): Promise<void> => {
  for (const target of SUPPORTED_TARGETS) {
    const shCache = await cacheFactory([target]);
    if (!shCache) {
      continue;
    }
    const cacheKeys = await shCache.keys();
    cacheKeys.forEach(async (key: Request | string) => {
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

const sleep = async (sleepTimeMs: number): Promise<void> => {
  await new Promise(resolve => {
    setTimeout(resolve, sleepTimeMs);
  });
};
