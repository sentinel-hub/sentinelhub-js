import { CancelTokenSource, AxiosRequestConfig, CancelToken as CancelTokenAxios } from 'axios';
import { CacheConfig } from './cacheHandlers';
export declare type RequestConfiguration = {
    authToken?: string | null;
    retries?: number;
    timeout?: number | null;
    cancelToken?: CancelToken;
    cache?: CacheConfig;
    responseType?: string;
    rewriteUrlFunc?: (url: string) => string;
};
export declare class CancelToken {
    protected token: CancelTokenAxios | null;
    protected source: CancelTokenSource | null;
    protected cacheKeys: Set<string>;
    constructor();
    setCancelTokenCacheKey(cacheKey: string): void;
    cancel(): void;
    getToken(): CancelTokenAxios;
}
export declare const isCancelled: (err: Error) => boolean;
export declare const getAxiosReqParams: (reqConfig: RequestConfiguration, defaultCache: CacheConfig) => AxiosRequestConfig;
