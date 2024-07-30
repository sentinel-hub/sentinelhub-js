import axios, { AxiosRequestConfig } from 'axios';
import { stringify, parseUrl, stringifyUrl } from 'query-string';
import { parseStringPromise } from 'xml2js';
import { EQUATOR_RADIUS, OgcServiceTypes, SH_SERVICE_HOSTNAMES_V3, SH_SERVICE_ROOT_URL } from './const';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { CACHE_CONFIG_30MIN, CACHE_CONFIG_30MIN_MEMORY } from '../utils/cacheHandlers';
import type { GetCapabilitiesWmtsXml } from './wmts.utils';
import { getAuthToken } from '../auth';
import { BBox } from '../bbox';
import { CRS_EPSG3857 } from '../crs';
import proj4 from 'proj4';

interface Capabilities {
  Service: [];
  Capability: [
    {
      Layer: [GetCapabilitiesXmlLayer];
    },
  ];
}

interface WMSCapabilities {
  WMS_Capabilities: Capabilities;
}

interface WMTMSCapabilities {
  WMT_MS_Capabilities: Capabilities;
}

export type GetCapabilitiesWmsXml = WMSCapabilities | WMTMSCapabilities;

export function isWMSCapabilities(
  capabilitiesXml: GetCapabilitiesWmsXml,
): capabilitiesXml is WMSCapabilities {
  return (capabilitiesXml as WMSCapabilities).WMS_Capabilities !== undefined;
}

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
  layers.forEach((l) => {
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

  const capabilities = isWMSCapabilities(parsedXml)
    ? parsedXml.WMS_Capabilities
    : parsedXml.WMT_MS_Capabilities;

  // GetCapabilities might use recursion to group layers, we should flatten them and remove those with no `Name`:
  const layersInfos = _flattenLayers(capabilities?.Capability[0].Layer).filter((layerInfo) => layerInfo.Name);
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
  throw new Error(`Could not parse instanceId from URL: ${baseUrl}`);
}

export function getSHServiceRootUrl(host: string): string {
  const shServiceRootUrl = Object.values(SH_SERVICE_ROOT_URL).find((url) => {
    const regex = new RegExp(url);
    if (regex.test(host)) {
      return url;
    }
  });

  if (shServiceRootUrl) {
    return shServiceRootUrl;
  }

  // The endpoint for fetching the list of layers is typically
  // https://services.sentinel-hub.com/, even for creodias datasets.
  // However there is an exception for Copernicus datasets, which have
  // a different endpoint for fetching the list of layers
  return SH_SERVICE_ROOT_URL.default;
}

export function getSHServiceRootUrlFromBaseUrl(baseUrl: string): string {
  let host = baseUrl;

  if (/\ogc\/wms/.test(baseUrl)) {
    host = baseUrl.substring(0, baseUrl.indexOf('/ogc/wms') + 1);
  }

  return getSHServiceRootUrl(host);
}

export async function fetchLayerParamsFromConfigurationService(
  shServiceHostName: string,
  instanceId: string,
  reqConfig: RequestConfiguration,
): Promise<any[]> {
  const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
  if (!authToken) {
    throw new Error('Must be authenticated to fetch layer params');
  }
  const configurationServiceHostName = shServiceHostName ?? SH_SERVICE_ROOT_URL.default;
  const url = `${configurationServiceHostName}configuration/v1/wms/instances/${instanceId}/layers`;
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
    ...l.datasourceDefaults,
    //maxCloudCoverPercent vs maxCloudCoverage
    ...(l.datasourceDefaults?.maxCloudCoverage !== undefined && {
      maxCloudCoverPercent: l.datasourceDefaults.maxCloudCoverage,
    }),
    evalscript: l.styles[0].evalScript,
    dataProduct: l.styles[0].dataProduct ? l.styles[0].dataProduct['@id'] : undefined,
    legend: l.styles.find((s: any) => s.name === l.defaultStyleName)
      ? l.styles.find((s: any) => s.name === l.defaultStyleName).legend
      : null,
  }));
  return layersParams;
}

export function ensureMercatorBBox(bbox: BBox): BBox {
  if (bbox.crs.authId === CRS_EPSG3857.authId) {
    return bbox;
  }

  const [minX, minY] = proj4(bbox.crs.authId, CRS_EPSG3857.authId, [bbox.minX, bbox.minY]);
  const [maxX, maxY] = proj4(bbox.crs.authId, CRS_EPSG3857.authId, [bbox.maxX, bbox.maxY]);
  return new BBox(CRS_EPSG3857, minX, minY, maxX, maxY);
}

export function metersPerPixel(bbox: BBox, width: number): number {
  const newBBox = ensureMercatorBBox(bbox);

  const widthInMeters = Math.abs(newBBox.maxX - newBBox.minX);
  const latitude = (newBBox.minY + newBBox.maxY) / 2;

  return (widthInMeters / width) * Math.cos(lat(latitude));
}

function lat(y: number): number {
  return 2 * (Math.PI / 4 - Math.atan(Math.exp(-y / EQUATOR_RADIUS)));
}
