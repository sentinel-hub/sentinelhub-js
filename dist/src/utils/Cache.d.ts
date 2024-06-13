import { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare type CacheTargets = CacheTarget[];
export declare enum CacheTarget {
    CACHE_API = "CACHE_API",
    MEMORY = "MEMORY"
}
export declare type CacheResponse = {
    data: any;
    status: number;
    statusText: string;
    headers: any;
};
export declare const CACHE_API_KEY = "sentinelhub-v1";
export declare const SUPPORTED_TARGETS: CacheTarget[];
export declare function cacheFactory(optionalTargets: CacheTargets): Promise<ShCache>;
export declare function doesTargetExist(target: CacheTarget): Promise<boolean>;
interface ShCache {
    set(key: string, response: AxiosResponse): Promise<void>;
    get(key: string, responseType: AxiosRequestConfig['responseType']): Promise<CacheResponse>;
    has(key: string): Promise<boolean>;
    keys(): Promise<readonly Request[]> | Promise<string[]>;
    delete(key: Request | string): Promise<void>;
    getHeaders(key: Request | string): Promise<Record<string, any>>;
    invalidate(): void;
}
export declare function invalidateCaches(optionalTargets?: CacheTargets): Promise<void>;
export {};
