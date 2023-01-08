import { TPDISearchParams, TPDITransactionParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';
export declare class PlanetDataProvider extends AbstractTPDProvider {
    constructor();
    protected getAdditionalSearchParams(params: TPDISearchParams): any;
    protected getAdditionalTransactionParams(items: string[], searchParams: TPDISearchParams, transactionParams: TPDITransactionParams): any;
    checkSubscriptionsSupported(): boolean;
}
