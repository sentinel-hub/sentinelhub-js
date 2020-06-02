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

export const getAxiosReqParams = (requestsConfig: RequestConfiguration): AxiosRequestConfig => {
  let axiosrequestsConfig: AxiosRequestConfig = {};
  if (!requestsConfig) {
    return axiosrequestsConfig;
  }
  if (requestsConfig.cancelToken) {
    axiosrequestsConfig.cancelToken = requestsConfig.cancelToken.getToken();
  }
  axiosrequestsConfig.retries = requestsConfig.retries;
  return axiosrequestsConfig;
};

// this is a class method wrapper that times out all open axios requests after the timeout specified in the method requestsConfig object
// the wrapper function takes a single argument - the index of the requestsConfig object inside method params
// if a timeout is not specified when calling the original method, the decorator returns the original invokation (does nothing)
export function timeoutWrapper(requestsConfigIndex: number): Function {
  return function(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function() {
      const context = this;
      const args = arguments;

      // retrieve requestsConfig from arguments...
      const getTimeout = (args: IArguments): number | undefined => {
        const requestConfig = args && args[requestsConfigIndex];
        if (requestConfig) {
          return requestConfig.timeout;
        }
        return undefined;
      };

      const timeout = getTimeout(args);

      if (timeout) {
        const timer = setTimeout(() => {
          axios.CancelToken && axios.CancelToken.source().cancel();
          clearTimeout(timer);
          throw new Error('The method did not finish before the specified timeout.');
        }, timeout);
        return originalMethod
          .apply(context, args)
          .then((result: any) => {
            clearTimeout(timer);
            return result;
          })
          .catch((e: Error) => {
            clearTimeout(timer);
            throw e;
          });
      } else {
        return originalMethod
          .apply(context, args)
          .then((result: any) => {
            return result;
          })
          .catch((e: Error) => {
            throw e;
          });
      }
    };
    return descriptor;
  };
}
