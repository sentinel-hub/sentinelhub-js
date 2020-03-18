import axios from 'axios';
import { stringify } from 'query-string';
import { parseStringPromise } from 'xml2js';

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

export async function fetchGetCapabilitiesXml(baseUrl: string): Promise<GetCapabilitiesXml> {
  const query = {
    service: 'wms',
    request: 'GetCapabilities',
    format: 'text/xml',
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const res = await axios.get(url, { responseType: 'text', useCache: true });
  const parsedXml = await parseStringPromise(res.data);
  return parsedXml;
}

export async function fetchGetCapabilitiesJson(baseUrl: string): Promise<any[]> {
  const query = {
    request: 'GetCapabilities',
    format: 'application/json',
  };
  const queryString = stringify(query, { sort: false });
  const url = `${baseUrl}?${queryString}`;
  const res = await axios.get(url, { responseType: 'json', useCache: true });
  return res.data.layers;
}

export async function fetchGetCapabilitiesJsonV1(baseUrl: string): Promise<any[]> {
  const instanceId = this.parseSHInstanceId(baseUrl);
  const url = `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
  const res = await axios.get(url, { responseType: 'json', useCache: true });
  return res.data.layers;
}
