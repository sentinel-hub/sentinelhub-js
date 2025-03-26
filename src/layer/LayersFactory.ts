import { parseUrl, stringifyUrl } from 'query-string';

import {
  fetchLayersFromGetCapabilitiesXml,
  fetchGetCapabilitiesJson,
  parseSHInstanceId,
  fetchLayerParamsFromConfigurationService,
  getSHServiceRootUrlFromBaseUrl,
  fetchGetCapabilitiesXml,
  GetCapabilitiesWmsXml,
  isWMSCapabilities,
} from './utils';
import { ensureTimeout } from '../utils/ensureTimeout';
import { OgcServiceTypes, SH_SERVICE_HOSTNAMES_V3, PLANET_FALSE_COLOR_TEMPLATES } from './const';
import {
  DATASET_S2L2A,
  DATASET_AWS_L8L1C,
  DATASET_S2L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSUS_DEM,
  DATASET_CDAS_DEM,
  DATASET_AWSEU_S1GRD,
  DATASET_S3SLSTR,
  DATASET_S3OLCI,
  DATASET_BYOC,
  DATASET_S5PL2,
  DATASET_AWS_HLS,
  Dataset,
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  DATASET_AWS_LTML1,
  DATASET_AWS_LTML2,
  DATASET_AWS_LMSSL1,
  DATASET_AWS_LETML1,
  DATASET_AWS_LETML2,
  DATASET_PLANET_NICFI,
  DATASET_CDAS_S1GRD,
  DATASET_CDAS_S2L2A,
  DATASET_CDAS_S2L1C,
  DATASET_CDAS_S3SLSTR,
  DATASET_CDAS_S3OLCI,
  DATASET_CDAS_S5PL2,
  DATASET_CDAS_S3OLCIL2,
  DATASET_CDAS_OTC_S2L2A,
  DATASET_CDAS_OTC_S1GRD,
  DATASET_CDAS_OTC_S2L1C,
  DATASET_CDAS_OTC_S3SLSTR,
  DATASET_CDAS_OTC_S3OLCI,
  DATASET_CDAS_OTC_S3OLCIL2,
  DATASET_CDAS_OTC_S5PL2,
  DATASET_CDAS_OTC_DEM,
  DATASET_CDAS_S3SYNERGYL2,
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
import { DEMCDASLayer } from './DEMCDASLayer';
import { Landsat8AWSLayer } from './Landsat8AWSLayer';
import { BYOCLayer } from './BYOCLayer';
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
import { getAuthToken } from '../auth';
import { HLSAWSLayer } from './HLSAWSLayer';
import { S1GRDCDASLayer } from './S1GRDCDASLayer';
import { S2L2ACDASLayer } from './S2L2ACDASLayer';
import { S2L1CCDASLayer } from './S2L1CCDASLayer';
import { S3OLCICDASLayer } from './S3OLCICDASLayer';
import { S3SLSTRCDASLayer } from './S3SLSTRCDASLayer';
import { S5PL2CDASLayer } from './S5PL2CDASLayer';
import { WmsWmtMsLayer } from './WmsWmtMsLayer';
import { S3OLCIL2CDASLayer } from './S3OLCIL2CDASLayer';
import { S3SYNL2CDASLayer } from './S3SYNL2CDASLayer';
export class LayersFactory {
  /*
    This class is responsible for creating the Layer subclasses from the limited information (like
    baseUrl). It needs to be aware of various services so it can fetch information from them and
    instantiate appropriate layers.
  */

  private static readonly DATASET_FROM_JSON_GETCAPAPABILITIES = [
    DATASET_AWSEU_S1GRD,
    DATASET_CDAS_S1GRD,
    DATASET_CDAS_OTC_S1GRD,
    DATASET_S2L2A,
    DATASET_S2L1C,
    DATASET_CDAS_S2L2A,
    DATASET_CDAS_OTC_S2L2A,
    DATASET_CDAS_S2L1C,
    DATASET_CDAS_OTC_S2L1C,
    DATASET_S3SLSTR,
    DATASET_S3OLCI,
    DATASET_CDAS_S3SLSTR,
    DATASET_CDAS_OTC_S3SLSTR,
    DATASET_CDAS_S3OLCI,
    DATASET_CDAS_OTC_S3OLCI,
    DATASET_CDAS_S3OLCIL2,
    DATASET_CDAS_OTC_S3OLCIL2,
    DATASET_CDAS_S3SYNERGYL2,
    DATASET_S5PL2,
    DATASET_CDAS_S5PL2,
    DATASET_CDAS_OTC_S5PL2,
    DATASET_AWS_L8L1C,
    DATASET_AWS_LOTL1,
    DATASET_AWS_LOTL2,
    DATASET_AWS_LTML1,
    DATASET_AWS_LTML2,
    DATASET_AWS_LMSSL1,
    DATASET_AWS_LETML1,
    DATASET_AWS_LETML2,
    DATASET_AWS_HLS,
    DATASET_MODIS,
    DATASET_AWS_DEM,
    DATASET_CDAS_DEM,
    DATASET_CDAS_OTC_DEM,
    DATASET_BYOC,
  ];

  private static readonly LAYER_FROM_DATASET_V3 = {
    [DATASET_AWSEU_S1GRD.id]: S1GRDAWSEULayer,
    [DATASET_CDAS_S1GRD.id]: S1GRDCDASLayer,
    [DATASET_CDAS_OTC_S1GRD.id]: S1GRDCDASLayer,
    [DATASET_S2L2A.id]: S2L2ALayer,
    [DATASET_S2L1C.id]: S2L1CLayer,
    [DATASET_CDAS_S2L2A.id]: S2L2ACDASLayer,
    [DATASET_CDAS_OTC_S2L2A.id]: S2L2ACDASLayer,
    [DATASET_CDAS_S2L1C.id]: S2L1CCDASLayer,
    [DATASET_CDAS_OTC_S2L1C.id]: S2L1CCDASLayer,
    [DATASET_S3SLSTR.id]: S3SLSTRLayer,
    [DATASET_CDAS_S3SLSTR.id]: S3SLSTRCDASLayer,
    [DATASET_CDAS_OTC_S3SLSTR.id]: S3SLSTRCDASLayer,
    [DATASET_S3OLCI.id]: S3OLCILayer,
    [DATASET_CDAS_S3OLCI.id]: S3OLCICDASLayer,
    [DATASET_CDAS_OTC_S3OLCI.id]: S3OLCICDASLayer,
    [DATASET_CDAS_S3OLCIL2.id]: S3OLCIL2CDASLayer,
    [DATASET_CDAS_S3SYNERGYL2.id]: S3SYNL2CDASLayer,
    [DATASET_CDAS_OTC_S3OLCIL2.id]: S3OLCIL2CDASLayer,
    [DATASET_S5PL2.id]: S5PL2Layer,
    [DATASET_CDAS_S5PL2.id]: S5PL2CDASLayer,
    [DATASET_CDAS_OTC_S5PL2.id]: S5PL2CDASLayer,
    [DATASET_AWS_L8L1C.id]: Landsat8AWSLayer,
    [DATASET_AWS_LOTL1.id]: Landsat8AWSLOTL1Layer,
    [DATASET_AWS_LOTL2.id]: Landsat8AWSLOTL2Layer,
    [DATASET_AWS_LTML1.id]: Landsat45AWSLTML1Layer,
    [DATASET_AWS_LTML2.id]: Landsat45AWSLTML2Layer,
    [DATASET_AWS_LMSSL1.id]: Landsat15AWSLMSSL1Layer,
    [DATASET_AWS_LETML1.id]: Landsat7AWSLETML1Layer,
    [DATASET_AWS_LETML2.id]: Landsat7AWSLETML2Layer,
    [DATASET_AWS_HLS.id]: HLSAWSLayer,
    [DATASET_MODIS.id]: MODISLayer,
    [DATASET_AWS_DEM.id]: DEMLayer,
    [DATASET_AWSUS_DEM.id]: DEMAWSUSLayer,
    [DATASET_CDAS_DEM.id]: DEMCDASLayer,
    [DATASET_CDAS_OTC_DEM.id]: DEMCDASLayer,
    [DATASET_BYOC.id]: BYOCLayer,
  };

  private static matchDatasetFromGetCapabilities(datasetId: string, baseUrl: string): Dataset | undefined {
    if (!datasetId) {
      return undefined;
    }

    const matchingDatasetIds: Dataset[] = LayersFactory.DATASET_FROM_JSON_GETCAPAPABILITIES.filter(
      (dataset: Dataset) => dataset.shJsonGetCapabilitiesDataset === datasetId,
    );

    if (matchingDatasetIds.length === 1) {
      return matchingDatasetIds[0];
    }

    return matchingDatasetIds.find((dataset: Dataset) => {
      return dataset.shServiceHostname && baseUrl.includes(dataset.shServiceHostname);
    });
  }

  public static async makeLayer(
    baseUrl: string,
    layerId: string,
    overrideConstructorParams: Record<string, any> | null,
    reqConfig?: RequestConfiguration,
    preferGetCapabilities: boolean = true,
  ): Promise<AbstractLayer> {
    const layer = await ensureTimeout(async (innerReqConfig) => {
      const layers = await LayersFactory.makeLayers(
        baseUrl,
        (lId: string) => lId === layerId,
        overrideConstructorParams,
        innerReqConfig,
        preferGetCapabilities,
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
    preferGetCapabilities: boolean = true,
    includeHighlights: boolean = false,
  ): Promise<AbstractLayer[]> {
    const returnValue = await ensureTimeout(async (innerReqConfig) => {
      for (let hostname of SH_SERVICE_HOSTNAMES_V3) {
        if (baseUrl.startsWith(hostname)) {
          return await this.makeLayersSHv3(
            baseUrl,
            filterLayers,
            overrideConstructorParams,
            innerReqConfig,
            preferGetCapabilities,
            includeHighlights,
          );
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
    preferGetCapabilities: boolean = true,
    includeHighlights: boolean = false,
  ): Promise<AbstractLayer[]> {
    const filteredLayersInfos = await this.getSHv3LayersInfo(
      baseUrl,
      reqConfig,
      filterLayers,
      preferGetCapabilities,
      includeHighlights,
    );

    return filteredLayersInfos.map(
      ({ layerId, dataset, title, description, legendUrl, evalscript, dataProduct, ...rest }) => {
        if (!dataset) {
          return new WmsLayer({ baseUrl, layerId, title, description });
        }

        const SHLayerClass = LayersFactory.LAYER_FROM_DATASET_V3[dataset.id];
        if (!SHLayerClass) {
          throw new Error(`Dataset ${dataset.id} is not defined in LayersFactory.LAYER_FROM_DATASET`);
        }
        const shServiceRootUrl = getSHServiceRootUrlFromBaseUrl(baseUrl);
        return new SHLayerClass({
          instanceId: parseSHInstanceId(baseUrl),
          layerId,
          evalscript: evalscript || null,
          evalscriptUrl: null,
          dataProduct: dataProduct || null,
          title,
          description,
          legendUrl,
          ...rest,
          // We must pass the maxCloudCoverPercent (S-2) or others (S-1) from legacyGetMapFromParams to the Layer
          // otherwise the default values from layer definition on the service will be used.
          ...overrideConstructorParams,
          shServiceRootUrl: shServiceRootUrl,
        });
      },
    );
  }

  private static async getSHv3LayersInfo(
    baseUrl: string,
    reqConfig: RequestConfiguration,
    filterLayers: Function,
    preferGetCapabilities: boolean = true,
    includeHighlights: boolean = false,
  ): Promise<any[]> {
    let layersInfos;
    //also check if auth token is present
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    let layersInfoFetched = false;
    // use configuration if possible
    if (authToken && preferGetCapabilities === false) {
      try {
        const layers = await fetchLayerParamsFromConfigurationService({
          shServiceHostName: getSHServiceRootUrlFromBaseUrl(baseUrl),
          instanceId: parseSHInstanceId(baseUrl),
          includeHighlights,
          reqConfig,
        });
        layersInfos = layers.map((l: any) => ({
          ...l,
          dataset: LayersFactory.matchDatasetFromGetCapabilities(l.type, baseUrl),
        }));
        layersInfoFetched = true;
      } catch (e) {
        console.error(e);
        // fallback to getCapabilities
      }
    }

    if (!layersInfoFetched) {
      const getCapabilitiesJson = await fetchGetCapabilitiesJson(baseUrl, reqConfig);
      layersInfos = getCapabilitiesJson.map((layerInfo) => ({
        layerId: layerInfo.id,
        title: layerInfo.name,
        description: layerInfo.description,
        dataset: LayersFactory.matchDatasetFromGetCapabilities(layerInfo.dataset, baseUrl),
        legendUrl: layerInfo.legendUrl,
      }));
    }

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter((l) => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos;
  }

  private static async makeLayersWms(
    baseUrl: string,
    filterLayers: Function | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const parsedLayers = await fetchLayersFromGetCapabilitiesXml(baseUrl, OgcServiceTypes.WMS, reqConfig);
    const layersInfos = parsedLayers.map((layerInfo) => ({
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
      filterLayers === null ? layersInfos : layersInfos.filter((l) => filterLayers(l.layerId, l.dataset));

    const parsedXml = (await fetchGetCapabilitiesXml(
      baseUrl,
      OgcServiceTypes.WMS,
      reqConfig,
    )) as GetCapabilitiesWmsXml;

    return filteredLayersInfos.map(({ layerId, title, description, legendUrl }) => {
      if (isWMSCapabilities(parsedXml)) {
        return new WmsLayer({ baseUrl, layerId, title, description, legendUrl });
      } else {
        return new WmsWmtMsLayer({ baseUrl, layerId, title, description, legendUrl });
      }
    });
  }

  private static async makeLayersWmts(
    baseUrl: string,
    filterLayers: Function | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overrideConstructorParams: Record<string, any> | null,
    reqConfig: RequestConfiguration,
  ): Promise<AbstractLayer[]> {
    const parsedLayers = await fetchLayersFromWmtsGetCapabilitiesXml(baseUrl, reqConfig);
    const layersInfos = parsedLayers.map((layerInfo) => ({
      layerId: layerInfo.Name[0],
      title: layerInfo.Title[0],
      description: layerInfo.Abstract ? layerInfo.Abstract[0] : null,
      dataset: null,
      legendUrl: layerInfo.Style[0].LegendURL,
      resourceUrl: layerInfo.ResourceUrl,
    }));

    const filteredLayersInfos =
      filterLayers === null ? layersInfos : layersInfos.filter((l) => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description, legendUrl, resourceUrl }) =>
        new WmtsLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }),
    );
  }

  // Analytic layers accept a proc parameter to specify a dynamically-rendered false color visualization, for example NDVI.
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
        dataset: DATASET_PLANET_NICFI,
        legendUrl: layerInfo.Style[0].LegendURL,
        resourceUrl: layerInfo.Name[0].includes('analytic')
          ? `${layerInfo.ResourceUrl}&proc=rgb`
          : layerInfo.ResourceUrl,
      };
      newLayers.push(layer);
      if (layer.layerId.includes('analytic')) {
        const parsedResourceUrl = parseUrl(layer.resourceUrl);
        const falseColorLayers = PLANET_FALSE_COLOR_TEMPLATES.map((template) => ({
          layerId: `${layer.layerId}_${template.titleSuffix}`,
          title: `${layer.title} ${template.titleSuffix}`,
          description: template.description,
          legendUrl: layer.legendUrl,
          dataset: layer.dataset,
          resourceUrl: stringifyUrl({
            url: parsedResourceUrl.url,
            query: { ...parsedResourceUrl.query, ...template.resourceUrlParams },
          }),
        }));
        newLayers.push(...falseColorLayers);
      }
    }
    const filteredLayersInfos =
      filterLayers === null ? newLayers : newLayers.filter((l) => filterLayers(l.layerId, l.dataset));

    return filteredLayersInfos.map(
      ({ layerId, title, description, legendUrl, resourceUrl }) =>
        new PlanetNicfiLayer({ baseUrl, layerId, title, description, legendUrl, resourceUrl }),
    );
  }
}
