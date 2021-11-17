import axios, { AxiosRequestConfig } from 'axios';
import { stringify, parseUrl, stringifyUrl } from 'query-string';
import { parseStringPromise } from 'xml2js';

import { OgcServiceTypes, SH_SERVICE_HOSTNAMES_V1_OR_V2, SH_SERVICE_HOSTNAMES_V3 } from './const';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';

export type GetCapabilitiesWmsXml = {
  WMS_Capabilities: {
    Service: [];
    Capability: [
      {
        Layer: GetCapabilitiesXmlWmsLayer[][];
      },
    ];
  };
};

export type GetCapabilitiesWmtsXml = {
  Capabilities: {
    'ows:ServiceIdentification': any[][];
    'ows:ServiceProvider': any[][];
    'ows:OperationsMetadata': any[][];
    Contents: GetCapabilitiesXmlWmtsLayer[][];
    ServiceMetadataURL: any[][];
  };
};

export type GetCapabilitiesXmlWmsLayer = {
  Name?: string[];
  Title: string[];
  Abstract: string[];
  Style: any[]; // Depending on the service, it can be an array of strings or an array of objects
  Dimension?: any[];
  Layer?: GetCapabilitiesXmlWmsLayer[];
};

export type GetCapabilitiesXmlWmtsLayer = {
  'ows:Title': string;
  'ows:Abstract': string;
  'ows:WGS84BoundingBox': {}[][];
  'ows:Identifier': string[];
  Style: any[];
  Format: string[];
  TileMatrixSetLink: any[];
  ResourceURL: any[];
  Layer?: GetCapabilitiesXmlWmtsLayer[];
};

export type GetCapabilitiesXmlLayer = GetCapabilitiesXmlWmsLayer;

export function createGetCapabilitiesXmlUrl(baseUrl: string, ogcServiceType: OgcServiceTypes): string {
  const defaultQueryParams = {
    service: ogcServiceType,
    request: 'GetCapabilities',
    format: 'text/xml',
  };

  const { url, query } = parseUrl(baseUrl);
  return stringifyUrl({ url: url, query: { ...defaultQueryParams, ...query } }, { sort: false });
}

async function fetchGetCapabilitiesXml(
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

function parseOgcLayers(parsedXml: any, ogcServiceType: OgcServiceTypes): GetCapabilitiesXmlLayer[] {
  if (ogcServiceType === OgcServiceTypes.WMTS) {
    return (parsedXml.Capabilities.Contents[0].Layer as GetCapabilitiesXmlWmtsLayer[]).map(l => {
      return {
        Name: [l['ows:Title']],
        Title: [l['ows:Title']],
        Abstract: [l['ows:Abstract']],
        Style: l.Style,
        Dimension: [],
        Layer: [],
      };
    });
  }
  if (ogcServiceType === OgcServiceTypes.WMS) {
    return parsedXml.WMS_Capabilities.Capability[0].Layer;
  }
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
  const parsedXml = await fetchGetCapabilitiesXml(baseUrl, ogcServiceType, reqConfig);
  // GetCapabilities might use recursion to group layers, we should flatten them and remove those with no `Name`:
  const layers = parseOgcLayers(parsedXml, ogcServiceType);
  const layersInfos = _flattenLayers(layers).filter(layerInfo => layerInfo.Name);
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
