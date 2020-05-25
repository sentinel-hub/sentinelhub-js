import axios, { CancelTokenSource, AxiosRequestConfig, CancelToken as CancelTokenAxios } from 'axios';

type TimeoutType = number | undefined;

export type RequestConfiguration = {
  cancelToken?: CancelToken;
  retries?: number;
  timeout: TimeoutType;
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

export function setMethodTimeout(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  descriptor.value = function() {
    const context = this;
    const args = arguments;
    const originalMethod = descriptor.value;

    // find requestsConfig inside arguments...
    const findTimeout = (args: IArguments): number | undefined => {
      const argumentArray = Array.from(args);
      const requestConfig = argumentArray.find(arg => arg && arg.timeout);
      if (requestConfig) {
        return requestConfig.timeout;
      }
      return undefined;
    };

    const timeout = findTimeout(args);

    if (timeout) {
      const timer = setTimeout(() => {
        throw new Error('The method did not finish before the specified timeout.');
      }, timeout);
      originalMethod
        .apply(context, args)
        .then((result: any) => {
          clearTimeout(timer);
          return result;
        })
        .catch((e: Error) => {
          clearTimeout(timer);
          throw e;
        });
    }
  };
  return descriptor;
}
