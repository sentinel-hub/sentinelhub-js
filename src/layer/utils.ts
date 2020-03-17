import axios, { AxiosResponse } from 'axios';
import { stringify } from 'query-string';
import { parseStringPromise } from 'xml2js';

import { getAuthToken, isAuthTokenSet } from 'src/auth';

let fetchCache: Record<string, Promise<AxiosResponse>> = {};

export type GetCapabilitiesXml = {
  WMS_Capabilities: {
    Service: [];
    Capability: [
      {
        Layer: [
          {
            Layer: [
              {
                Name: string[];
                Title: string[];
                Abstract: string[];
                Style: any[]; // Depending on the service, it can be an array of strings or an array of objects
                Dimension?: any[];
              },
            ];
          },
        ];
      },
    ];
  };
};

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

export async function fetchGetCapabilitiesXml(
  baseUrl: string,
  forceFetch = false,
): Promise<GetCapabilitiesXml> {
  const query = {
    service: 'wms',
    request: 'GetCapabilities',
    format: 'text/xml',
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const res = await fetchCached(url, { responseType: 'text' }, forceFetch);
  const parsedXml = await parseStringPromise(res.data);
  return parsedXml;
}

export async function fetchGetCapabilitiesJson(baseUrl: string, forceFetch = false): Promise<any[]> {
  const query = {
    request: 'GetCapabilities',
    format: 'application/json',
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const res = await fetchCached(url, { responseType: 'json' }, forceFetch);
  return res.data.layers;
}

export async function fetchGetCapabilitiesJsonV1(baseUrl: string, forceFetch = false): Promise<any[]> {
  const instanceId = this.parseSHInstanceId(baseUrl);
  const url = `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
  const res = await fetchCached(url, { responseType: 'json' }, forceFetch);
  return res.data.layers;
}
