import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type CacheTargets = CacheTarget[];
export enum CacheTarget {
  CACHE_API = 'CACHE_API',
  MEMORY = 'MEMORY',
}
export type CacheResponse = {
  data: any;
  status: number;
  statusText: string;
  headers: any;
};

export const CACHE_API_KEY = 'sentinelhub-v1';
export const SUPPORTED_TARGETS = [CacheTarget.CACHE_API, CacheTarget.MEMORY];
const FALLBACK_TARGET = CacheTarget.MEMORY;

export const memoryCache = new Map();

// Factory will return an instance of a Cache interface.
// The first availble target will be used
// By default we will use cache_api if availble, if not we will cache in memory
// user can also specify to just use in memory caching
// If user provides a CacheTarget.CACHE_API and cache_api is not availble we will fallback to memory
export function cacheFactory(optionalTargets: CacheTargets): ShCache {
  const targets = optionalTargets || SUPPORTED_TARGETS;
  const target = getFirstUsuableTarget(targets);
  return constructCache(target);
}

function getFirstUsuableTarget(targets: CacheTargets): CacheTarget {
  let firstTargetToUse = undefined; // default to memory if target is not supported
  for (const key of targets) {
    if (doesTargetExist(key)) {
      firstTargetToUse = key;
      break;
    }
  }
  return firstTargetToUse;
}

export function doesTargetExist(target: CacheTarget): boolean {
  switch (target) {
    case CacheTarget.CACHE_API:
      return Boolean(window.caches);
    case CacheTarget.MEMORY:
      return true;
    default:
      return false;
  }
}

function constructCache(target: CacheTarget): ShCache {
  switch (target) {
    case CacheTarget.CACHE_API:
      return new CacheApi();
    case CacheTarget.MEMORY:
      return new MemoryCache();
    default:
      return null;
  }
}

interface ShCache {
  set(key: string, response: AxiosResponse): Promise<void>;
  get(key: string, responseType: AxiosRequestConfig['responseType']): Promise<CacheResponse>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  delete(key: string): Promise<void>;
  getHeaders(key: string): Promise<Record<string, any>>;
  invalidate(): void;
}

class MemoryCache implements ShCache {
  private cache: Record<string, any>;
  public constructor() {
    this.cache = memoryCache;
  }

  public async set(key: string, response: AxiosResponse): Promise<void> {
    this.cache.set(key, response);
  }

  public async get(key: string): Promise<CacheResponse> {
    const cachedResponse: AxiosResponse = this.cache.get(key);
    if (!cachedResponse) {
      return null;
    }
    return {
      data: cachedResponse.data,
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers: cachedResponse.headers,
    };
  }

  public has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  public async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  public async getHeaders(key: string): Promise<Record<string, any>> {
    const cachedResponse: AxiosResponse = this.cache.get(key);
    if (!cachedResponse) {
      return null;
    }
    return cachedResponse.headers;
  }

  public invalidate(): void {
    this.cache.clear();
  }
}

class CacheApi implements ShCache {
  private cache: Record<string, any>;
  public constructor() {
    this.cache = caches.open(CACHE_API_KEY);
  }

  public async set(key: string, response: AxiosResponse): Promise<void> {
    const cache = await this.cache;
    const responseData = this.serializeResponseData(response);
    cache.put(key, responseData);
  }

  public async get(key: string, responseType: ResponseType): Promise<CacheResponse> {
    const cache = await this.cache;
    const response: Response = await cache.match(key);
    if (!response) {
      return null;
    }

    return {
      data: await this.deSerializeResponseData(response, responseType),
      status: response.status,
      statusText: response.statusText,
      headers: await this.deSeriarialeHeaders(response.headers),
    };
  }

  public async has(key: string): Promise<boolean> {
    const cache = await this.cache;
    const response = await cache.match(key);
    return Boolean(response);
  }

  public async keys(): Promise<string[]> {
    const cache = await this.cache;
    return await cache.keys();
  }

  public async delete(key: string): Promise<void> {
    const cache = await this.cache;
    await cache.delete(key);
  }

  public async getHeaders(key: string): Promise<Record<string, any>> {
    const cache = await this.cache;
    const response: Response = await cache.match(key);
    if (!response) {
      return null;
    }
    return await this.deSeriarialeHeaders(response.headers);
  }

  public async invalidate(): Promise<void> {
    const cache = await this.cache;
    const cacheKeys = await cache.keys();
    for (let key of cacheKeys) {
      await cache.delete(key);
    }
  }

  private serializeResponseData(response: AxiosResponse): any {
    let responseData;
    switch (response.request.responseType) {
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
        throw new Error('Unsupported response type: ' + response.request.responseType);
    }
    return new Response(responseData, response);
  }

  private async deSerializeResponseData(
    cachedResponse: Response,
    responseType: AxiosRequestConfig['responseType'],
  ): Promise<any> {
    switch (responseType) {
      case 'blob':
        return await cachedResponse.clone().blob();
      case 'arraybuffer':
        return await cachedResponse.clone().arrayBuffer();
      case 'text':
        return await cachedResponse.clone().text();
      case 'json':
      case undefined: // axios defaults to json https://github.com/axios/axios#request-config
        return await cachedResponse.clone().json();
      default:
        throw new Error('Unsupported response type: ' + responseType);
    }
  }

  private async deSeriarialeHeaders(headers: Response['headers']): Promise<Record<string, any>> {
    const newHeaders: Record<string, any> = {};
    for (let key of headers.keys()) {
      newHeaders[key] = headers.get(key);
    }
    return newHeaders;
  }
}

export async function invalidateCaches(optionalTargets?: CacheTargets): Promise<void> {
  const targets = optionalTargets || SUPPORTED_TARGETS;
  for (const target of targets) {
    if (!doesTargetExist(target)) {
      continue;
    }
    switch (target) {
      case CacheTarget.CACHE_API:
        await new CacheApi().invalidate();
      case CacheTarget.MEMORY:
        await new MemoryCache().invalidate();
      default:
        break;
    }
  }
}
