import { RequestConfiguration } from '../utils/cancelRequests';
import { S1GRDAWSEULayer } from './S1GRDAWSEULayer';
export declare class S1GRDCDASLayer extends S1GRDAWSEULayer {
    readonly dataset: import("./dataset").Dataset;
    getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any>;
}
