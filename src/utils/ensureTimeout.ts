import { CancelToken, RequestConfiguration } from './cancelRequests';

export const ensureTimeout = async (
  reqConfig: RequestConfiguration,
  promise: () => Promise<any>,
): Promise<any> => {
  const { cancelToken, timeout } = reqConfig;

  if (!timeout) {
    return promise;
  }

  if (!cancelToken) {
    try {
      const token = new CancelToken();
      reqConfig.cancelToken = token;
    } catch (e) {
      throw e;
    }
  }

  const timer = setTimeout(() => {
    reqConfig.cancelToken.cancel();
    clearTimeout(timer);
  }, timeout);

  const resolvedValue = await promise;
  clearTimeout(timer);
  return resolvedValue;
};
