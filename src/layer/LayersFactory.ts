import { stringify } from 'query-string';
import { parseString } from 'xml2js';

import { fetchCached } from 'src/layer/utils';
import {
  DATASET_S2L2A,
  DATASET_AWS_L8L1C,
  DATASET_S2L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWS_S1GRD_IW,
} from 'src/layer/dataset';
import { AbstractLayer } from 'src/layer/AbstractLayer';
import { WmsLayer } from 'src/layer/WmsLayer';
import { S1GRDIWAWSLayer } from 'src/layer/S1GRDIWAWSLayer';
import { S2L2ALayer } from 'src/layer/S2L2ALayer';
import { S2L1CLayer } from 'src/layer/S2L1CLayer';
import { MODISLayer } from 'src/layer/MODISLayer';
import { DEMLayer } from 'src/layer/DEMLayer';
import { Landsat8AWSLayer } from 'src/layer/Landsat8AWSLayer';

type GetCapabilitiesXml = {
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
              }
            ];
          }
        ];
      }
    ];
  };
};

export class LayersFactory {
  /*
    This class is responsible for creating the Layer subclasses from the limited information (like
    baseUrl). It needs to be aware of various services so it can fetch information from them and
    instantiate appropriate layers.
  */

  public static readonly KNOWN_SH_SERVICE_HOSTNAMES: string[] = [
    'https://services.sentinel-hub.com/',
    'https://services-uswest2.sentinel-hub.com/',
  ];

  private static readonly DATASET_FROM_JSON_GETCAPAPABILITIES = {
    [DATASET_S2L2A.shJsonGetCapabilitiesDataset]: DATASET_S2L2A,
    [DATASET_S2L1C.shJsonGetCapabilitiesDataset]: DATASET_S2L1C,
    [DATASET_AWS_L8L1C.shJsonGetCapabilitiesDataset]: DATASET_AWS_L8L1C,
    [DATASET_MODIS.shJsonGetCapabilitiesDataset]: DATASET_MODIS,
    [DATASET_AWS_DEM.shJsonGetCapabilitiesDataset]: DATASET_AWS_DEM,
    [DATASET_AWS_S1GRD_IW.shJsonGetCapabilitiesDataset]: DATASET_AWS_S1GRD_IW,
  };

  private static readonly LAYER_FROM_DATASET = {
    [DATASET_S2L2A.id]: S2L2ALayer,
    [DATASET_S2L1C.id]: S2L1CLayer,
    [DATASET_AWS_L8L1C.id]: Landsat8AWSLayer,
    [DATASET_MODIS.id]: MODISLayer,
    [DATASET_AWS_DEM.id]: DEMLayer,
    [DATASET_AWS_S1GRD_IW.id]: S1GRDIWAWSLayer,
  };

  private static async getLayersListFromBaseUrl(baseUrl: string, forceFetch = false): Promise<any[]> {
    for (let hostname of LayersFactory.KNOWN_SH_SERVICE_HOSTNAMES) {
      if (baseUrl.startsWith(hostname)) {
        const getCapabilitiesJson = await LayersFactory.fetchGetCapabilitiesJson(baseUrl, forceFetch);
        return getCapabilitiesJson.map(layerInfo => ({
          layerId: layerInfo.id,
          title: layerInfo.name,
          description: layerInfo.description,
          dataset:
            layerInfo.dataset && LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
              ? LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
              : null,
        }));
      }
    }

    const parsedXml = await LayersFactory.fetchGetCapabilitiesXml(baseUrl, forceFetch);
    return parsedXml.WMS_Capabilities.Capability[0].Layer[0].Layer.map(layerInfo => ({
      layerId: layerInfo.Name[0],
      title: layerInfo.Title[0],
      description: layerInfo.Abstract[0],
      datasetId: null,
    }));
  }

  private static async parseXml(xmlString: string): Promise<GetCapabilitiesXml> {
    return new Promise((resolve, reject) => {
      parseString(xmlString, (err: object, result: GetCapabilitiesXml) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  private static async fetchGetCapabilitiesXml(
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
    const parsedXml = await LayersFactory.parseXml(res.data);
    return parsedXml;
  }

  private static async fetchGetCapabilitiesJson(baseUrl: string, forceFetch = false): Promise<any[]> {
    const query = {
      request: 'GetCapabilities',
      format: 'application/json',
    };
    const queryString = stringify(query, { sort: false });
    const url = `${baseUrl}?${queryString}`;
    const res = await fetchCached(url, { responseType: 'json' }, forceFetch);
    return res.data.layers;
  }

  private static parseSHInstanceId(baseUrl: string): string {
    const INSTANCE_ID_LENGTH = 36;
    for (let hostname of LayersFactory.KNOWN_SH_SERVICE_HOSTNAMES) {
      const prefix = `${hostname}ogc/wms/`;
      if (!baseUrl.startsWith(prefix)) {
        continue;
      }
      const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
      return instanceId;
    }
    throw new Error(`Could not parse instanceId from URL: ${baseUrl}`);
  }

  public static async makeLayers(
    baseUrl: string,
    filterLayers: Function | null = null,
  ): Promise<AbstractLayer[]> {
    const layersInfos = await LayersFactory.getLayersListFromBaseUrl(baseUrl);
    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));
    return filteredLayersInfos.map(({ layerId, dataset, title, description }) => {
      if (dataset) {
        const SHLayerClass = LayersFactory.LAYER_FROM_DATASET[dataset.id];
        if (!SHLayerClass) {
          throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET`);
        }
        return new SHLayerClass(
          LayersFactory.parseSHInstanceId(baseUrl),
          layerId,
          null,
          null,
          null,
          title,
          description,
        );
      } else {
        return new WmsLayer(baseUrl, layerId, title, description);
      }
    });
  }
}
