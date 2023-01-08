import { TPDISearchParams, TPDITransactionParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';
export declare class MaxarDataProvider extends AbstractTPDProvider {
    constructor();
    addSearchPagination(): void;
    protected getAdditionalSearchParams(params: TPDISearchParams): any;
    protected getAdditionalTransactionParams(items: string[], searchParams: TPDISearchParams, transactionParams: TPDITransactionParams): any;
}
