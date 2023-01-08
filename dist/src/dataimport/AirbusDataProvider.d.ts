import { TPDISearchParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';
export declare class AirbusDataProvider extends AbstractTPDProvider {
    constructor();
    protected getAdditionalSearchParams(params: TPDISearchParams): any;
    protected getAdditionalTransactionParams(items: string[], searchParams: TPDISearchParams): any;
}
