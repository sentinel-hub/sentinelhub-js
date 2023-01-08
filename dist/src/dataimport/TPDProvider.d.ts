import { AxiosRequestConfig } from 'axios';
import { TPDProvider, TPDISearchParams, TPDITransactionParams } from './const';
export interface TPDProviderInterface {
    getSearchPayload(params: TPDISearchParams): any;
    getTransactionPayload(name: string, collectionId: string, items: string[], searchParams: TPDISearchParams, transactionParams?: TPDITransactionParams): any;
    addSearchPagination(requestConfig: AxiosRequestConfig, count: number, viewtoken: string): void;
    checkSubscriptionsSupported(): boolean;
}
export declare abstract class AbstractTPDProvider implements TPDProviderInterface {
    protected provider: TPDProvider;
    getProvider(): TPDProvider;
    addSearchPagination(requestConfig: AxiosRequestConfig, count: number, viewtoken: string): void;
    protected getCommonSearchParams(params: TPDISearchParams): any;
    protected getAdditionalSearchParams(params: TPDISearchParams): any;
    getSearchPayload(params: TPDISearchParams): any;
    protected getAdditionalTransactionParams(items: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    searchParams: TPDISearchParams, // eslint-disable-line @typescript-eslint/no-unused-vars
    transactionParams: TPDITransactionParams): any;
    getTransactionPayload(name: string, collectionId: string, items: string[], searchParams: TPDISearchParams, transactionParams?: TPDITransactionParams | null): any;
    checkSubscriptionsSupported(): boolean;
}
