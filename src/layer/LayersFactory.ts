import { stringify } from 'query-string';
import { parseStringPromise } from 'xml2js';

import { fetchCached } from 'src/layer/utils';
import {
  DATASET_S2L2A,
  DATASET_AWS_L8L1C,
  DATASET_S2L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSEU_S1GRD,
  DATASET_S3SLSTR,
  DATASET_S3OLCI,
  DATASET_BYOC,
  DATASET_S5PL2,
  DATASET_EOCLOUD_S1GRD,
  DATASET_EOCLOUD_LANDSAT5,
  DATASET_EOCLOUD_LANDSAT7,
  DATASET_EOCLOUD_LANDSAT8,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  Dataset,
} from 'src/layer/dataset';
import { AbstractLayer } from 'src/layer/AbstractLayer';
import { WmsLayer } from 'src/layer/WmsLayer';
import { S1GRDAWSEULayer } from 'src/layer/S1GRDAWSEULayer';
import { S2L2ALayer } from 'src/layer/S2L2ALayer';
import { S2L1CLayer } from 'src/layer/S2L1CLayer';
import { S3SLSTRLayer } from 'src/layer/S3SLSTRLayer';
import { S3OLCILayer } from 'src/layer/S3OLCILayer';
import { S5PL2Layer } from 'src/layer/S5PL2Layer';
import { MODISLayer } from 'src/layer/MODISLayer';
import { DEMLayer } from 'src/layer/DEMLayer';
import { Landsat8AWSLayer } from 'src/layer/Landsat8AWSLayer';
import { BYOCLayer } from 'src/layer/BYOCLayer';
import { S1GRDEOCloudLayer } from 'src/layer/S1GRDEOCloudLayer';
import { Landsat5EOCloudLayer } from 'src/layer/Landsat5EOCloudLayer';
import { Landsat7EOCloudLayer } from 'src/layer/Landsat7EOCloudLayer';
import { Landsat8EOCloudLayer } from 'src/layer/Landsat8EOCloudLayer';
import { EnvisatMerisEOCloudLayer } from 'src/layer/EnvisatMerisEOCloudLayer';

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
                Dimension?: any[];
              },
            ];
          },
        ];
      },
    ];
  };
};

export class LayersFactory {
  /*
    This class is responsible for creating the Layer subclasses from the limited information (like
    baseUrl). It needs to be aware of various services so it can fetch information from them and
    instantiate appropriate layers.
  */

  public static readonly SH_SERVICE_HOSTNAMES_V1_OR_V2: string[] = ['https://eocloud.sentinel-hub.com/'];

  public static readonly SH_SERVICE_HOSTNAMES_V3: string[] = [
    'https://services.sentinel-hub.com/',
    'https://services-uswest2.sentinel-hub.com/',
    'https://creodias.sentinel-hub.com/',
  ];

  private static readonly DATASET_FROM_JSON_GETCAPAPABILITIES = {
    [DATASET_AWSEU_S1GRD.shJsonGetCapabilitiesDataset]: DATASET_AWSEU_S1GRD,
    [DATASET_S2L2A.shJsonGetCapabilitiesDataset]: DATASET_S2L2A,
    [DATASET_S2L1C.shJsonGetCapabilitiesDataset]: DATASET_S2L1C,
    [DATASET_S3SLSTR.shJsonGetCapabilitiesDataset]: DATASET_S3SLSTR,
    [DATASET_S3OLCI.shJsonGetCapabilitiesDataset]: DATASET_S3OLCI,
    [DATASET_S5PL2.shJsonGetCapabilitiesDataset]: DATASET_S5PL2,
    [DATASET_AWS_L8L1C.shJsonGetCapabilitiesDataset]: DATASET_AWS_L8L1C,
    [DATASET_EOCLOUD_ENVISAT_MERIS.shJsonGetCapabilitiesDataset]: DATASET_EOCLOUD_ENVISAT_MERIS,
    [DATASET_MODIS.shJsonGetCapabilitiesDataset]: DATASET_MODIS,
    [DATASET_AWS_DEM.shJsonGetCapabilitiesDataset]: DATASET_AWS_DEM,
  };

  private static readonly DATASET_FROM_JSON_GETCAPABILITIES_V1: Record<string, Dataset> = {
    S1: DATASET_EOCLOUD_S1GRD,
    S1_EW: DATASET_EOCLOUD_S1GRD,
    S1_EW_SH: DATASET_EOCLOUD_S1GRD,
    L5: DATASET_EOCLOUD_LANDSAT5,
    L7: DATASET_EOCLOUD_LANDSAT7,
    L8: DATASET_EOCLOUD_LANDSAT8,
    ENV: DATASET_EOCLOUD_ENVISAT_MERIS,
  };

  private static readonly LAYER_FROM_DATASET_V3 = {
    [DATASET_AWSEU_S1GRD.id]: S1GRDAWSEULayer,
    [DATASET_S2L2A.id]: S2L2ALayer,
    [DATASET_S2L1C.id]: S2L1CLayer,
    [DATASET_S3SLSTR.id]: S3SLSTRLayer,
    [DATASET_S3OLCI.id]: S3OLCILayer,
    [DATASET_S5PL2.id]: S5PL2Layer,
    [DATASET_AWS_L8L1C.id]: Landsat8AWSLayer,
    [DATASET_MODIS.id]: MODISLayer,
    [DATASET_AWS_DEM.id]: DEMLayer,
    [DATASET_BYOC.id]: BYOCLayer,
  };

  private static readonly LAYER_FROM_DATASET_V12 = {
    [DATASET_EOCLOUD_S1GRD.id]: S1GRDEOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT5.id]: Landsat5EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT7.id]: Landsat7EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT8.id]: Landsat8EOCloudLayer,
    [DATASET_EOCLOUD_ENVISAT_MERIS.id]: EnvisatMerisEOCloudLayer,
  };

  public static async fetchGetCapabilitiesXml(
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

  private static async fetchGetCapabilitiesJsonV1(baseUrl: string, forceFetch = false): Promise<any[]> {
    const instanceId = this.parseSHInstanceId(baseUrl);
    const url = `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
    const res = await fetchCached(url, { responseType: 'json' }, forceFetch);
    return res.data.layers;
  }

  private static parseSHInstanceId(baseUrl: string): string {
    const INSTANCE_ID_LENGTH = 36;
    // AWS:
    for (let hostname of LayersFactory.SH_SERVICE_HOSTNAMES_V3) {
      const prefix = `${hostname}ogc/wms/`;
      if (!baseUrl.startsWith(prefix)) {
        continue;
      }
      const instanceId = baseUrl.substr(prefix.length, INSTANCE_ID_LENGTH);
      return instanceId;
    }
    // EOCloud:
    for (let hostname of LayersFactory.SH_SERVICE_HOSTNAMES_V1_OR_V2) {
      const prefix = `${hostname}v1/wms/`;
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
    for (let hostname of LayersFactory.SH_SERVICE_HOSTNAMES_V3) {
      if (baseUrl.startsWith(hostname)) {
        return await this.makeLayersSHv3(baseUrl, filterLayers);
      }
    }

    for (let hostname of LayersFactory.SH_SERVICE_HOSTNAMES_V1_OR_V2) {
      if (baseUrl.startsWith(hostname)) {
        return await this.makeLayersSHv12(baseUrl, filterLayers);
      }
    }

    return await this.makeLayersWms(baseUrl, filterLayers);
  }

  private static async makeLayersSHv3(
    baseUrl: string,
    filterLayers: Function | null,
  ): Promise<AbstractLayer[]> {
    const getCapabilitiesJson = await LayersFactory.fetchGetCapabilitiesJson(baseUrl);
    const layersInfos = getCapabilitiesJson.map(layerInfo => ({
      layerId: layerInfo.id,
      title: layerInfo.name,
      description: layerInfo.description,
      dataset:
        layerInfo.dataset && LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
          ? LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
          : null,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(({ layerId, dataset, title, description }) => {
      if (!dataset) {
        return new WmsLayer({ baseUrl, layerId, title, description });
      }

      const SHLayerClass = LayersFactory.LAYER_FROM_DATASET_V3[dataset.id];
      if (!SHLayerClass) {
        throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET`);
      }
      return new SHLayerClass({
        instanceId: LayersFactory.parseSHInstanceId(baseUrl),
        layerId,
        evalscript: null,
        evalscriptUrl: null,
        dataProduct: null,
        title,
        description,
      });
    });
  }

  private static async makeLayersSHv12(
    baseUrl: string,
    filterLayers: Function | null,
  ): Promise<AbstractLayer[]> {
    const getCapabilitiesJsonV1 = await LayersFactory.fetchGetCapabilitiesJsonV1(baseUrl);

    const result: AbstractLayer[] = [];
    for (let layerInfo of getCapabilitiesJsonV1) {
      const layerId = layerInfo.name;
      const dataset = LayersFactory.DATASET_FROM_JSON_GETCAPABILITIES_V1[layerInfo.settings.datasourceName];
      if (!dataset) {
        throw new Error(`Unknown dataset for layer ${layerId} (${layerInfo.settings.datasourceName})`);
      }

      if (filterLayers) {
        const keepLayer = Boolean(filterLayers(layerId, dataset));
        if (!keepLayer) {
          continue;
        }
      }

      const SH12LayerClass = LayersFactory.LAYER_FROM_DATASET_V12[dataset.id];
      if (!SH12LayerClass) {
        throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET_V12`);
      }
      const layer = SH12LayerClass.makeLayer(
        layerInfo,
        LayersFactory.parseSHInstanceId(baseUrl),
        layerId,
        layerInfo.settings.evalJSScript || null,
        null,
        layerInfo.settings.title,
        layerInfo.settings.description,
      );
      result.push(layer);
    }
    return result;
  }

  private static async makeLayersWms(
    baseUrl: string,
    filterLayers: Function | null,
  ): Promise<AbstractLayer[]> {
    const parsedXml = await LayersFactory.fetchGetCapabilitiesXml(baseUrl);
    const layersInfos = parsedXml.WMS_Capabilities.Capability[0].Layer[0].Layer.map(layerInfo => ({
      layerId: layerInfo.Name[0],
      title: layerInfo.Title[0],
      description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
      dataset: null,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description }) => new WmsLayer({ baseUrl, layerId, title, description }),
    );
  }
}
