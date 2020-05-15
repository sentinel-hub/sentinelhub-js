import axios, { CancelTokenSource, AxiosRequestConfig, CancelToken as CancelTokenAxios } from 'axios';

export type RequestConfiguration = {
  cancelToken?: CancelToken;
  retries?: number;
};

export class CancelToken {
  protected token: CancelTokenAxios | null = null;
  protected source: CancelTokenSource | null = null;
  private constructor() {
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
