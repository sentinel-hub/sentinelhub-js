import { RequestConfiguration } from './cancelRequests';
export declare const ensureTimeout: (innerFunction: (requestConfig: RequestConfiguration) => Promise<any>, reqConfig?: RequestConfiguration) => Promise<any>;
