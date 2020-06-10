import { CancelToken, RequestConfiguration } from './cancelRequests';

export const ensureTimeout = async (
  innerFunction: (requestConfig: RequestConfiguration) => Promise<any>,
  reqConfig?: RequestConfiguration,
): Promise<any> => {
  if (!reqConfig || !reqConfig.timeout) {
    const innerResult = await innerFunction(reqConfig);
    return innerResult;
  }

  const newReqConfig = { ...reqConfig };
  const { cancelToken, timeout } = newReqConfig;

  if (!cancelToken) {
    const token = new CancelToken();
    newReqConfig.cancelToken = token;
  }

  const timer = setTimeout(() => {
    newReqConfig.cancelToken.cancel();
  }, timeout);

  try {
    // delete the timeout in case innerFunction has a nested ensureTimeout in order to prevent unnecessary setTimeout calls
    delete newReqConfig.timeout;
    const resolvedValue = await innerFunction(newReqConfig);
    clearTimeout(timer);
    return resolvedValue;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};
