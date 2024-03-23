import { RequestConfiguration } from '../utils/cancelRequests';
import { S2L2ALayer } from './S2L2ALayer';
export declare class S2L2ACDASLayer extends S2L2ALayer {
    readonly dataset: import("./dataset").Dataset;
    getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any>;
}
