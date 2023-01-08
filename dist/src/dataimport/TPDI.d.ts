import { RequestConfiguration } from '../utils/cancelRequests';
import { Quota, TPDICollections, TPDProvider, TPDISearchParams, TPDITransaction, TPDSearchResult, TPDITransactionSearchParams, TPDITransactionSearchResult, TPDITransactionParams, TPDITransactionCompatibleCollection } from './const';
export declare class TPDI {
    static getQuota(TDPICollectionId: TPDICollections, reqConfig?: RequestConfiguration): Promise<Quota>;
    static getQuotas(reqConfig?: RequestConfiguration): Promise<Quota[]>;
    static search(provider: TPDProvider, params: TPDISearchParams, reqConfig?: RequestConfiguration, count?: number, viewtoken?: string): Promise<TPDSearchResult>;
    static getThumbnail(collectionId: TPDICollections, productId: string, reqConfig?: RequestConfiguration): Promise<Blob>;
    static createOrder(provider: TPDProvider, name: string, collectionId: string, items: string[], searchParams: TPDISearchParams, orderParams?: TPDITransactionParams, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static createSubscription(provider: TPDProvider, name: string, collectionId: string, items: string[], searchParams: TPDISearchParams, subscriptionParams?: TPDITransactionParams, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static getOrders(params?: TPDITransactionSearchParams, reqConfig?: RequestConfiguration, count?: number, viewtoken?: string): Promise<TPDITransactionSearchResult>;
    static getSubscriptions(params?: TPDITransactionSearchParams, reqConfig?: RequestConfiguration, count?: number, viewtoken?: string): Promise<TPDITransactionSearchResult>;
    static getOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static getSubscription(id: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static deleteOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<void>;
    static deleteSubscription(id: string, reqConfig?: RequestConfiguration): Promise<void>;
    static confirmOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static confirmSubscription(id: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static cancelSubscription(id: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction>;
    static getCompatibleCollections(provider: TPDProvider, params: TPDISearchParams, reqConfig?: RequestConfiguration): Promise<TPDITransactionCompatibleCollection[]>;
}
