import axios, { AxiosResponse } from 'axios';

import { getAuthToken, isAuthTokenSet } from 'src/auth';

let fetchCache: Record<string, Promise<AxiosResponse>> = {};

export function fetchCached(
  url: string,
  axiosParams: Record<string, any>,
  forceFetch = false,
): Promise<AxiosResponse> {
  if (!forceFetch && fetchCache[url]) {
    return fetchCache[url];
  }
  if (isAuthTokenSet()) {
    const token = getAuthToken();
    if (!axiosParams['headers']) {
      axiosParams['headers'] = {};
    }
    axiosParams.headers['Authorization'] = `Bearer ${token}`;
  }
  fetchCache[url] = axios.get(url, axiosParams);
  return fetchCache[url];
}
