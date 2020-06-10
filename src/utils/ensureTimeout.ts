import { CancelToken, isCancelled, RequestConfiguration } from './cancelRequests';

export const ensureTimeout = async (
  innerFunction: (requestConfig: RequestConfiguration) => Promise<any>,
  reqConfig?: RequestConfiguration,
): Promise<any> => {
  if (!reqConfig || !reqConfig.timeout) {
    const innerResult = await innerFunction(reqConfig);
    return innerResult;
  }

  const newConfig = { ...reqConfig };
  const { cancelToken, timeout } = newConfig;

  if (!cancelToken) {
    const token = new CancelToken();
    newConfig.cancelToken = token;
  }

  const timer = setTimeout(() => {
    newConfig.cancelToken.cancel();
    clearTimeout(timer);
  }, timeout);

  try {
    const resolvedValue = await innerFunction(newConfig);
    clearTimeout(timer);
    return resolvedValue;
  } catch (e) {
    if (isCancelled(e)) {
      clearTimeout(timer);
      return null;
    } else {
      clearTimeout(timer);
      throw e;
    }
  }
};
