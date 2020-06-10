import { CancelToken, RequestConfiguration } from './cancelRequests';

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
  }, timeout);

  try {
    // delete the timeout in case innerFunction has a nested ensureTimeout in order to prevent unnecessary setTimeout calls
    delete newConfig.timeout;
    const resolvedValue = await innerFunction(newConfig);
    clearTimeout(timer);
    return resolvedValue;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};
