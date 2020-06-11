import { CancelToken, RequestConfiguration } from './cancelRequests';

// a wrapper function that ensures network requests triggered by the inner function get cancelled after the specified timeout
// the wrapper function will receive a single argument - a RequestConfiguration object that should be used to trigger all axios network requests
export const ensureTimeout = async (
  innerFunction: (requestConfig: RequestConfiguration) => Promise<any>,
  reqConfig?: RequestConfiguration,
): Promise<any> => {
  if (!reqConfig || !reqConfig.timeout) {
    // if timeout was not specified, call the passed function with the original config
    return await innerFunction(reqConfig);
  }

  const innerReqConfig: RequestConfiguration = {
    ...reqConfig,
    cancelToken: reqConfig.cancelToken ? reqConfig.cancelToken : new CancelToken(),
    // delete the timeout in case innerFunction has a nested ensureTimeout in order to prevent unnecessary setTimeout calls
    timeout: undefined,
  };

  const timer = setTimeout(() => {
    innerReqConfig.cancelToken.cancel();
  }, reqConfig.timeout);

  try {
    const resolvedValue = await innerFunction(innerReqConfig);
    clearTimeout(timer);
    return resolvedValue;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};
