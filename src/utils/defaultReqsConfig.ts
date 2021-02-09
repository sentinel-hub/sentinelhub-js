import { RequestConfiguration } from './cancelRequests';

let defaultRequestsConfig = {};

export const setDefaultRequestsConfig = (reqConfig: RequestConfiguration): void => {
  defaultRequestsConfig = reqConfig;
};

export const getDefaultRequestsConfig = (): RequestConfiguration => {
  return defaultRequestsConfig;
};
