import axios, { AxiosRequestConfig } from 'axios';
import { stringify } from 'query-string';
import { parseStringPromise } from 'xml2js';

import { SH_SERVICE_HOSTNAMES_V1_OR_V2, SH_SERVICE_HOSTNAMES_V3 } from 'src/layer/const';
import { getAxiosReqParams, RequestConfiguration } from 'src/utils/cancelRequests';
import { CACHE_CONFIG_30MIN } from 'src/utils/cacheHandlers';

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
                Layer?: any[];
              },
            ];
          },
        ];
      },
    ];
  };
};

export async function fetchGetCapabilitiesXml(
  baseUrl: string,
  reqConfig: RequestConfiguration,
): Promise<GetCapabilitiesXml> {
  const query = {
    service: 'wms',
    request: 'GetCapabilities',
    format: 'text/xml',
  };
  const axiosReqConfig: AxiosRequestConfig = {
    responseType: 'text',
    ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const res = await axios.get(url, axiosReqConfig);
  const parsedXml = await parseStringPromise(res.data);
  return parsedXml;
}

export async function fetchGetCapabilitiesJson(
  baseUrl: string,
  reqConfig: RequestConfiguration,
): Promise<any[]> {
  const query = {
    request: 'GetCapabilities',
    format: 'application/json',
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const axiosReqConfig: AxiosRequestConfig = {
    responseType: 'json',
    ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
  };
  const res = await axios.get(url, axiosReqConfig);
  return res.data.layers;
}

export async function fetchGetCapabilitiesJsonV1(
  baseUrl: string,
  reqConfig: RequestConfiguration,
): Promise<any[]> {
  const instanceId = parseSHInstanceId(baseUrl);
  const url = `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
  const axiosReqConfig: AxiosRequestConfig = {
    responseType: 'json',
    ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
  };
  const res = await axios.get(url, axiosReqConfig);
  return res.data.layers;
}

export function parseSHInstanceId(baseUrl: string): string {
  const INSTANCE_ID_LENGTH = 36;
  // AWS:
  for (let hostname of SH_SERVICE_HOSTNAMES_V3) {
    const prefix = `${hostname}ogc/wms/`;
    if (!baseUrl.startsWith(prefix)) {
      continue;
    }
    const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
    return instanceId;
  }
  // EOCloud:
  for (let hostname of SH_SERVICE_HOSTNAMES_V1_OR_V2) {
    const prefix = `${hostname}v1/wms/`;
    if (!baseUrl.startsWith(prefix)) {
      continue;
    }
    const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
    return instanceId;
  }
  throw new Error(`Could not parse instanceId from URL: ${baseUrl}`);
}
