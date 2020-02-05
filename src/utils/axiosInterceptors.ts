import axios, { AxiosRequestConfig } from 'axios';
import { stringify } from 'query-string';

const SENTINEL_HUB_CACHE = 'sentinelhub-v1';
const DELAY = 3000;
export interface RequestConfig extends AxiosRequestConfig {
  useCache?: boolean;
  retries?: number;
}

export const registerAxiosCacheRetryInterceptors = (): any => {
  axios.interceptors.request.use(fetchCachedResponse, error => Promise.reject(error));
  axios.interceptors.response.use(setCacheResponse, retryRequests);
};

const fetchCachedResponse = async (request: any): Promise<any> => {
  if (!(request && request.useCache)) {
    return request;
  }

  let cacheKey;
  switch (request.method) {
    // post requests are not supported, so we mimic a get request, by formatting the body/params to sha256, and constructing a key/url
    // idea taken from https://blog.cloudflare.com/introducing-the-workers-cache-api-giving-you-control-over-how-your-content-is-cached/
    case 'post':
      const body = JSON.stringify(request.data);
      const hash = await sha256(body);
      cacheKey = generateCacheKey(request.url, hash);
      break;
    case 'get':
      cacheKey = generateCacheKey(request.url, stringify(request.params));
      break;
    default:
      return request;
  }

  let cache;
  try {
    cache = await caches.open(SENTINEL_HUB_CACHE);
  } catch (err) {
    console.warn('Caching failed', err);
    return request;
  }

  const response = await cache.match(cacheKey);
  if (response) {
    request.adapter = async () => {
      // response from cache api follows the same structure as the fetch api, hence this hack
      // could be better if the caller handles the response (response.blob) instead of the caching function?
      let responseData;
      switch (request.responseType) {
        case 'blob':
          responseData = await response.blob();
          break;
        case 'text':
          responseData = await response.text();
          break;
        case 'json':
        case undefined:
          responseData = await response.json();
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
  }

  return request;
};

const setCacheResponse = async (response: any): Promise<any> => {
  if (response.config && response.config.useCache) {
    let cache;
    try {
      cache = await caches.open(SENTINEL_HUB_CACHE);
    } catch (err) {
      console.warn('Caching failed', err);
      return response;
    }

    let cacheKey;
    if (response.config.method === 'get') {
      cacheKey = generateCacheKey(response.config.url, stringify(response.config));
    }
    if (response.config.method === 'post') {
      const body = response.config.data;
      const hash = await sha256(body);
      cacheKey = generateCacheKey(response.config.url, hash);
    }

    const hasCache = await cache.match(cacheKey);
    if (!hasCache) {
      cache.put(cacheKey, new Response(response.data, response));
    }
  }
  return response;
};

const retryRequests = (err: any): any => {
  if (err.config) {
    const config = err.config;
    if (!config.retries) {
      return Promise.reject(err);
    }

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.retries) {
      console.error('retries exceeded', config.retryCount);
      return Promise.reject(err);
    }
    const DELAY = 3000;
    config.retryCount += 1;
    return new Promise(resolve => setTimeout(() => resolve(axios(config)), DELAY));
  }
  return Promise.reject(err);
};

const generateCacheKey = (url: any, params = ''): string => url + '?' + params;

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
