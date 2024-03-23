import { AxiosResponse } from 'axios';
import { CacheTarget, CacheTargets } from './Cache';
export declare const CACHE_CONFIG_30MIN: {
    expiresIn: number;
};
export declare const CACHE_CONFIG_NOCACHE: {
    expiresIn: number;
};
export declare const CACHE_CONFIG_30MIN_MEMORY: {
    targets: CacheTarget[];
    expiresIn: number;
};
export declare const EXPIRY_HEADER_KEY = "cache_expires";
export declare type CacheConfig = {
    expiresIn: number;
    targets?: CacheTargets;
};
export declare const cacheableRequestsInProgress: Set<unknown>;
export declare const removeCacheableRequestsInProgress: (cacheKey: string) => void;
export declare const fetchCachedResponse: (request: any) => Promise<any>;
export declare const saveCacheResponse: (response: AxiosResponse<any>) => Promise<any>;
export declare const cacheStillValid: (headers: Record<string, any>) => boolean;
export declare const deleteExpiredCachedItemsAtInterval: () => void;
