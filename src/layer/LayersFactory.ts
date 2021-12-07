import { stringify } from 'query-string';

import {
  fetchLayersFromGetCapabilitiesXml,
  fetchGetCapabilitiesJsonV1,
  fetchGetCapabilitiesJson,
  parseSHInstanceId,
} from './utils';
import { ensureTimeout } from '../utils/ensureTimeout';
import {
  OgcServiceTypes,
  SH_SERVICE_HOSTNAMES_V1_OR_V2,
  SH_SERVICE_HOSTNAMES_V3,
  PLANET_FALSE_COLOR_TEMPLATES,
} from './const';
import {
  DATASET_S2L2A,
  DATASET_AWS_L8L1C,
  DATASET_S2L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSUS_DEM,
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
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  DATASET_AWS_LTML1,
  DATASET_AWS_LTML2,
  DATASET_AWS_LMSSL1,
  DATASET_AWS_LETML1,
  DATASET_AWS_LETML2,
} from './dataset';
import { AbstractLayer } from './AbstractLayer';
import { WmsLayer } from './WmsLayer';
import { S1GRDAWSEULayer } from './S1GRDAWSEULayer';
import { S2L2ALayer } from './S2L2ALayer';
import { S2L1CLayer } from './S2L1CLayer';
import { S3SLSTRLayer } from './S3SLSTRLayer';
import { S3OLCILayer } from './S3OLCILayer';
import { S5PL2Layer } from './S5PL2Layer';
import { MODISLayer } from './MODISLayer';
import { DEMAWSUSLayer } from './DEMAWSUSLayer';
import { DEMLayer } from './DEMLayer';
import { Landsat8AWSLayer } from './Landsat8AWSLayer';
import { BYOCLayer } from './BYOCLayer';
import { S1GRDEOCloudLayer } from './S1GRDEOCloudLayer';
import { Landsat5EOCloudLayer } from './Landsat5EOCloudLayer';
import { Landsat7EOCloudLayer } from './Landsat7EOCloudLayer';
import { Landsat8EOCloudLayer } from './Landsat8EOCloudLayer';
import { EnvisatMerisEOCloudLayer } from './EnvisatMerisEOCloudLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { Landsat8AWSLOTL1Layer } from './Landsat8AWSLOTL1Layer';
import { Landsat8AWSLOTL2Layer } from './Landsat8AWSLOTL2Layer';
import { Landsat45AWSLTML1Layer } from './Landsat45AWSLTML1Layer';
import { Landsat45AWSLTML2Layer } from './Landsat45AWSLTML2Layer';
import { Landsat15AWSLMSSL1Layer } from './Landsat15AWSLMSSL1Layer';
import { Landsat7AWSLETML1Layer } from './Landsat7AWSLETML1Layer';
import { Landsat7AWSLETML2Layer } from './Landsat7AWSLETML2Layer';
import { WmtsLayer } from './WmtsLayer';
import { fetchLayersFromWmtsGetCapabilitiesXml } from './wmts.utils';
import { PlanetNicfiLayer } from './PlanetNicfi';
export class LayersFactory {
  /*
    This class is responsible for creating the Layer subclasses from the limited information (like
    baseUrl). It needs to be aware of various services so it can fetch information from them and
    instantiate appropriate layers.
  */

  private static readonly DATASET_FROM_JSON_GETCAPAPABILITIES = {
    [DATASET_AWSEU_S1GRD.shJsonGetCapabilitiesDataset]: DATASET_AWSEU_S1GRD,
    [DATASET_S2L2A.shJsonGetCapabilitiesDataset]: DATASET_S2L2A,
    [DATASET_S2L1C.shJsonGetCapabilitiesDataset]: DATASET_S2L1C,
    [DATASET_S3SLSTR.shJsonGetCapabilitiesDataset]: DATASET_S3SLSTR,
    [DATASET_S3OLCI.shJsonGetCapabilitiesDataset]: DATASET_S3OLCI,
    [DATASET_S5PL2.shJsonGetCapabilitiesDataset]: DATASET_S5PL2,
    [DATASET_AWS_L8L1C.shJsonGetCapabilitiesDataset]: DATASET_AWS_L8L1C,
    [DATASET_AWS_LOTL1.shJsonGetCapabilitiesDataset]: DATASET_AWS_LOTL1,
    [DATASET_AWS_LOTL2.shJsonGetCapabilitiesDataset]: DATASET_AWS_LOTL2,
    [DATASET_AWS_LTML1.shJsonGetCapabilitiesDataset]: DATASET_AWS_LTML1,
    [DATASET_AWS_LTML2.shJsonGetCapabilitiesDataset]: DATASET_AWS_LTML2,
    [DATASET_AWS_LMSSL1.shJsonGetCapabilitiesDataset]: DATASET_AWS_LMSSL1,
    [DATASET_AWS_LETML1.shJsonGetCapabilitiesDataset]: DATASET_AWS_LETML1,
    [DATASET_AWS_LETML2.shJsonGetCapabilitiesDataset]: DATASET_AWS_LETML2,
    [DATASET_EOCLOUD_ENVISAT_MERIS.shJsonGetCapabilitiesDataset]: DATASET_EOCLOUD_ENVISAT_MERIS,
    [DATASET_MODIS.shJsonGetCapabilitiesDataset]: DATASET_MODIS,
    [DATASET_AWS_DEM.shJsonGetCapabilitiesDataset]: DATASET_AWS_DEM,
    [DATASET_BYOC.shJsonGetCapabilitiesDataset]: DATASET_BYOC,
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
    [DATASET_AWS_LOTL1.id]: Landsat8AWSLOTL1Layer,
    [DATASET_AWS_LOTL2.id]: Landsat8AWSLOTL2Layer,
    [DATASET_AWS_LTML1.id]: Landsat45AWSLTML1Layer,
    [DATASET_AWS_LTML2.id]: Landsat45AWSLTML2Layer,
    [DATASET_AWS_LMSSL1.id]: Landsat15AWSLMSSL1Layer,
    [DATASET_AWS_LETML1.id]: Landsat7AWSLETML1Layer,
    [DATASET_AWS_LETML2.id]: Landsat7AWSLETML2Layer,
    [DATASET_MODIS.id]: MODISLayer,
    [DATASET_AWS_DEM.id]: DEMLayer,
    [DATASET_AWSUS_DEM.id]: DEMAWSUSLayer,
    [DATASET_BYOC.id]: BYOCLayer,
  };

  private static readonly LAYER_FROM_DATASET_V12 = {
    [DATASET_EOCLOUD_S1GRD.id]: S1GRDEOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT5.id]: Landsat5EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT7.id]: Landsat7EOCloudLayer,
    [DATASET_EOCLOUD_LANDSAT8.id]: Landsat8EOCloudLayer,
    [DATASET_EOCLOUD_ENVISAT_MERIS.id]: EnvisatMerisEOCloudLayer,
  };

  public static async makeLayer(
    baseUrl: string,
    layerId: string,
    overrideConstructorParams: Record<string, any> | null,
    reqConfig?: RequestConfiguration,
  ): Promise<AbstractLayer> {
    const layer = await ensureTimeout(async innerReqConfig => {
      const layers = await LayersFactory.makeLayers(
        baseUrl,
        (lId: string) => lId === layerId,
        overrideConstructorParams,
        innerReqConfig,
      );
      if (layers.length === 0) {
        return null;
      }
      return layers[0];
    }, reqConfig);
    return layer;
  }

  public static async makeLayers(
    baseUrl: string,
    filterLayers: Function | null = null,
    overrideConstructorParams?: Record<string, any> | null,
    reqConfig?: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const returnValue = await ensureTimeout(async innerReqConfig => {
      for (let hostname of SH_SERVICE_HOSTNAMES_V3) {
        if (baseUrl.startsWith(hostname)) {
          return await this.makeLayersSHv3(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
        }
      }

      for (let hostname of SH_SERVICE_HOSTNAMES_V1_OR_V2) {
        if (baseUrl.startsWith(hostname)) {
          return await this.makeLayersSHv12(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
        }
      }
      if (baseUrl.includes('/wmts')) {
        if (baseUrl.includes('api.planet.com/basemaps/')) {
          return this.makePlanetBasemapLayers(
            baseUrl,
            filterLayers,
            overrideConstructorParams,
            innerReqConfig,
          );
        }
        return await this.makeLayersWmts(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
      } else {
        return await this.makeLayersWms(baseUrl, filterLayers, overrideConstructorParams, innerReqConfig);
      }
    }, reqConfig);
    return returnValue;
  }

  private static async makeLayersSHv3(
    baseUrl: string,
    filterLayers: Function | null,
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const getCapabilitiesJson = await fetchGetCapabilitiesJson(baseUrl, reqConfig);
    const layersInfos = getCapabilitiesJson.map(layerInfo => ({
      layerId: layerInfo.id,
      title: layerInfo.name,
      description: layerInfo.description,
      dataset:
        layerInfo.dataset && LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
          ? LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES[layerInfo.dataset]
          : null,
      legendUrl: layerInfo.legendUrl,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(({ layerId, dataset, title, description, legendUrl }) => {
      if (!dataset) {
        return new WmsLayer({ baseUrl, layerId, title, description });
      }

      const SHLayerClass = LayersFactory.LAYER_FROM_DATASET_V3[dataset.id];
      if (!SHLayerClass) {
        throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET`);
      }
      return new SHLayerClass({
        instanceId: parseSHInstanceId(baseUrl),
        layerId,
        evalscript: null,
        evalscriptUrl: null,
        dataProduct: null,
        title,
        description,
        legendUrl,
        // We must pass the maxCloudCoverPercent (S-2) or others (S-1) from legacyGetMapFromParams to the Layer
        // otherwise the default values from layer definition on the service will be used.
        ...overrideConstructorParams,
      });
    });
  }

  private static async makeLayersSHv12(
    baseUrl: string,
    filterLayers: Function | null,
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const getCapabilitiesJsonV1 = await fetchGetCapabilitiesJsonV1(baseUrl, reqConfig);

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

      // We must pass the maxCloudCoverPercent (S-2) or others (S-1) from legacyGetMapFromParams to the Layer
      // otherwise the default values from layer definition on the service will be used.
      if (overrideConstructorParams && overrideConstructorParams.maxCloudCoverPercent) {
        layerInfo.settings.maxCC = overrideConstructorParams.maxCloudCoverPercent;
      }

      const layer = SH12LayerClass.makeLayer(
        layerInfo,
        parseSHInstanceId(baseUrl),
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const parsedLayers = await fetchLayersFromGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMS, reqConfig);
    const layersInfos = parsedLayers.map(layerInfo => ({
      layerId: layerInfo.Name[0],
      title: layerInfo.Title[0],
      description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
      dataset: null,
      legendUrl:
        layerInfo.Style && layerInfo.Style[0].LegendURL
          ? layerInfo.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
          : layerInfo.Layer && layerInfo.Layer[0].Style && layerInfo.Layer[0].Style[0].LegendURL
          ? layerInfo.Layer[0].Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
          : null,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description, legendUrl }) =>
        new WmsLayer({ baseUrl, layerId, title, description, legendUrl }),
    );
  }

  private static async makeLayersWmts(
    baseUrl: string,
    filterLayers: Function | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const parsedLayers = await fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig);
    const layersInfos = parsedLayers.map(layerInfo => ({
      layerId: layerInfo.Name[0],
      title: layerInfo.Title[0],
      description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
      dataset: null,
      legendUrl: layerInfo.Style[0].LegendURL,
      resourceUrl: layerInfo.ResourceUrl,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description, legendUrl, resourceUrl }) =>
        new WmtsLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }),
    );
  }

  // Analtyc layers accept a proc parameter to specify a dynamically-rendered false color visualization, for example NDVI.
  // Since proc is not a standard a WMTS parameter and there is a list of specified options at https://developers.planet.com/docs/basemaps/tile-services/indices/#remote-sensing-indices-legends
  // we can treat these as extra layers and add them to makeLayers response.
  private static async makePlanetBasemapLayers(
    baseUrl: string,
    filterLayers: Function | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    let newLayers = [];
    const parsedLayers = await fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig);
    for (let layerInfo of parsedLayers) {
      const layer = {
        layerId: layerInfo.Name[0],
        title: layerInfo.Title[0],
        description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
        dataset: null as string | null,
        legendUrl: layerInfo.Style[0].LegendURL,
        resourceUrl: layerInfo.ResourceUrl,
      };
      newLayers.push(layer);
      if (layer.layerId.includes('analytic')) {
        const falseColorLayers = PLANET_FALSE_COLOR_TEMPLATES.map(template => ({
          layerId: `${layer.layerId}_${template.titleSuffix}`,
          title: `${layer.title} ${template.titleSuffix}`,
          description: template.description,
          legendUrl: layer.legendUrl,
          dataset: layer.dataset,
          resourceUrl: `${layer.resourceUrl}&${stringify(template.resourceUrlParams)}`,
        }));
        newLayers.push(...falseColorLayers);
      }
    }
    const filteredLayersInfos =
      filterLayers === null ? newLayers : newLayers.filter(l => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description, legendUrl, resourceUrl }) =>
        new PlanetNicfiLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }),
    );
  }
}
