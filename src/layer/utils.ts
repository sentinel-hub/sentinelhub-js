import axios, { AxiosRequestConfig } from 'axios';
import { stringify, parseUrl, stringifyUrl } from 'query-string';
import { parseStringPromise } from 'xml2js';

import { OgcServiceTypes, SH_SERVICE_HOSTNAMES_V1_OR_V2, SH_SERVICE_HOSTNAMES_V3 } from './const';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { CACHE_CONFIG_30MIN, CACHE_CONFIG_30MIN_MEMORY } from '../utils/cacheHandlers';
import { GetCapabilitiesWmtsXml } from './wmts.utils';
import { getAuthToken } from '../auth';

export type GetCapabilitiesWmsXml = {
  WMS_Capabilities: {
    Service: [];
    Capability: [
      {
        Layer: [GetCapabilitiesXmlLayer];
      },
    ];
  };
};

export type GetCapabilitiesXmlLayer = {
  Name?: string[];
  Title: string[];
  Abstract: string[];
  Style: any[]; // Depending on the service, it can be an array of strings or an array of objects
  Dimension?: any[];
  Layer?: GetCapabilitiesXmlLayer[];
  ResourceUrl?: string;
};

export function createGetCapabilitiesXmlUrl(baseUrl: string, ogcServiceType: OgcServiceTypes): string {
  const defaultQueryParams = {
    service: ogcServiceType,
    request: 'GetCapabilities',
    format: 'text/xml',
  };

  const { url, query } = parseUrl(baseUrl);
  return stringifyUrl({ url: url, query: { ...defaultQueryParams, ...query } }, { sort: false });
}

export async function fetchGetCapabilitiesXml(
  baseUrl: string,
  ogcServiceType: OgcServiceTypes,
  reqConfig: RequestConfiguration,
): Promise<GetCapabilitiesWmsXml | GetCapabilitiesWmtsXml> {
  const axiosReqConfig: AxiosRequestConfig = {
    responseType: 'text',
    ...getAxiosReqParams(reqConfig, CACHE_CONFIG_30MIN),
  };
  const url = createGetCapabilitiesXmlUrl(baseUrl, ogcServiceType);
  const res = await axios.get(url, axiosReqConfig);
  const parsedXml = await parseStringPromise(res.data);
  return parsedXml;
}

function _flattenLayers(
  layers: GetCapabilitiesXmlLayer[],
  result: GetCapabilitiesXmlLayer[] = [],
): GetCapabilitiesXmlLayer[] {
  layers.forEach(l => {
    result.push(l);
    if (l.Layer) {
      _flattenLayers(l.Layer, result);
    }
  });
  return result;
}

export async function fetchLayersFromGetCapabilitiesXml(
  baseUrl: string,
  ogcServiceType: OgcServiceTypes,
  reqConfig: RequestConfiguration,
): Promise<GetCapabilitiesXmlLayer[]> {
  const parsedXml = (await fetchGetCapabilitiesXml(
    baseUrl,
    ogcServiceType,
    reqConfig,
  )) as GetCapabilitiesWmsXml;
  // GetCapabilities might use recursion to group layers, we should flatten them and remove those with no `Name`:
  const layersInfos = _flattenLayers(parsedXml.WMS_Capabilities.Capability[0].Layer).filter(
    layerInfo => layerInfo.Name,
  );
  return layersInfos;
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

/*
  rename some layer parameters as they are named differently in the configuration service response
*/
const convertLayerParams = (params: Record<string, any>): Record<string, any> => {
  return {
    ...params,
    ...(params?.maxCloudCoverage !== undefined && {
      maxCloudCoverPercent: params.maxCloudCoverage,
    }),
    ...(params?.demInstance !== undefined && {
      demInstanceType: params.demInstance,
    }),
    ...(params?.backCoeff !== undefined && {
      backscatterCoeff: params.backCoeff,
    }),
    ...(params?.EGM !== undefined && {
      egm: params.EGM,
    }),
  };
};

export async function fetchLayerParamsFromConfigurationService(
  instanceId: string,
  reqConfig: RequestConfiguration,
): Promise<any[]> {
  const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
  if (!authToken) {
    throw new Error('Must be authenticated to fetch layer params');
  }
  // Note that for SH v3 service, the endpoint for fetching the list of layers is always
  // https://services.sentinel-hub.com/, even for creodias datasets:
  const url = `https://services.sentinel-hub.com/configuration/v1/wms/instances/${instanceId}/layers`;
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  // reqConfig might include the cache config from getMap, which could cache instances/${this.instanceId}/layers
  // we do not want this as layer updates will not invalidate this cache, so we rather cache to memory
  const reqConfigWithMemoryCache = {
    ...reqConfig,
    // Do not override cache if cache is disabled with `expiresIn: 0`
    cache:
      reqConfig && reqConfig.cache && reqConfig.cache.expiresIn === 0
        ? reqConfig.cache
        : CACHE_CONFIG_30MIN_MEMORY,
  };
  const requestConfig: AxiosRequestConfig = {
    responseType: 'json',
    headers: headers,
    ...getAxiosReqParams(reqConfigWithMemoryCache, null),
  };
  const res = await axios.get(url, requestConfig);
  const layersParams = res.data.map((l: any) => ({
    layerId: l.id,
    title: l.title,
    description: l.description,
    ...convertLayerParams(l.datasourceDefaults),
    evalscript: l.styles[0].evalScript,
    dataProduct: l.styles[0].dataProduct ? l.styles[0].dataProduct['@id'] : undefined,
    legend: l.styles.find((s: any) => s.name === l.defaultStyleName)
      ? l.styles.find((s: any) => s.name === l.defaultStyleName).legend
      : null,
  }));
  return layersParams;
}
