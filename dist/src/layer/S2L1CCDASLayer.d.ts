import { RequestConfiguration } from '../utils/cancelRequests';
import { S2L1CLayer } from './S2L1CLayer';
export declare class S2L1CCDASLayer extends S2L1CLayer {
    readonly dataset: import("./dataset").Dataset;
    getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any>;
}
