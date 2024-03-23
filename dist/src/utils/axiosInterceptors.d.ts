import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CacheConfig } from './cacheHandlers';
declare module 'axios' {
    interface AxiosRequestConfig {
        retries?: number;
        cancelToken?: CancelToken;
        cacheKey?: string;
        cache?: CacheConfig;
        rewriteUrlFunc?: (url: string) => string;
        setCancelTokenCacheKey?: (cacheKey: string) => void;
    }
}
export declare const registerInitialAxiosInterceptors: () => any;
export declare const addAxiosRequestInterceptor: (customInterceptor: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>) => void;
export declare const addAxiosResponseInterceptor: (customInterceptor: (config: AxiosResponse<any>) => AxiosResponse<any> | Promise<AxiosResponse<any>>) => void;
