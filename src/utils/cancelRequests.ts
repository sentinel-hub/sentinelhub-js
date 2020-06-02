import axios, { CancelTokenSource, AxiosRequestConfig, CancelToken as CancelTokenAxios } from 'axios';

export type RequestConfiguration = {
  cancelToken?: CancelToken;
  retries?: number;
  timeout?: number | null;
};

export class CancelToken {
  protected token: CancelTokenAxios | null = null;
  protected source: CancelTokenSource | null = null;
  public constructor() {
    this.source = axios.CancelToken.source();
    this.token = this.source.token;
  }

  public cancel(): void {
    this.source.cancel();
  }

  public getToken(): CancelTokenAxios {
    return this.token;
  }
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};

export const getAxiosReqParams = (reqConfig: RequestConfiguration): AxiosRequestConfig => {
  let axiosReqConfig: AxiosRequestConfig = {};
  if (!reqConfig) {
    return axiosReqConfig;
  }
  if (reqConfig.cancelToken) {
    axiosReqConfig.cancelToken = reqConfig.cancelToken.getToken();
  }
  axiosReqConfig.retries = reqConfig.retries;
  return axiosReqConfig;
};

export const ensureTimeout = async (reqConfig: RequestConfiguration, promise: Promise<any>): Promise<any> => {
  const { cancelToken, timeout } = reqConfig;

  if (!timeout) {
    return promise;
  }

  if (!cancelToken) {
    const token = new CancelToken();
    reqConfig.cancelToken = token;
  }

  const timer = setTimeout(() => {
    reqConfig.cancelToken.cancel();
    clearTimeout(timer);
  }, timeout);

  const resolvedValue = await promise;
  clearTimeout(timer);
  return resolvedValue;
};
