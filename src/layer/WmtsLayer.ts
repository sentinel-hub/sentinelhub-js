import axios, { AxiosRequestConfig } from 'axios';

import { GetMapParams, ApiType, OgcServiceTypes } from './const';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { fetchLayersFromGetCapabilitiesXml } from './utils';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getAxiosReqParams } from '../utils/cancelRequests';
import { bboxToXyz, getResourceUrl } from './wmts';

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  resourceURL?: string | null;
}

export class WmtsLayer extends AbstractLayer {
  protected baseUrl: string;
  protected layerId: string;
  protected resourceURL: string;

  public constructor({
    baseUrl,
    layerId,
    title = null,
    description = null,
    legendUrl = null,
    resourceURL = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
    this.resourceURL = resourceURL;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (!this.resourceURL) {
        const parsedLayers = await fetchLayersFromGetCapabilitiesXml(
          this.baseUrl,
          OgcServiceTypes.WMTS,
          innerReqConfig,
        );
        const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
        this.resourceURL = getResourceUrl(layer);
      }
    }, reqConfig);
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    return await ensureTimeout(async innerReqConfig => {
      await this.updateLayerFromServiceIfNeeded(reqConfig);
      const paramsWithoutEffects = { ...params };
      delete paramsWithoutEffects.gain;
      delete paramsWithoutEffects.gamma;
      delete paramsWithoutEffects.effects;
      const url = this.getMapUrl(paramsWithoutEffects, api);

      const requestConfig: AxiosRequestConfig = {
        // 'blob' responseType does not work with Node.js:
        responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer',
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
      };
      const response = await axios.get(url, requestConfig);
      return response.data;
    });
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMTS) {
      throw new Error('Only WMTS is supported on this layer');
    }

    if (!params.bbox && !params.tileCoord) {
      throw new Error('No bbox or x,y coordinates provided');
    }
    if (!this.resourceURL) {
      throw new Error('No resource URL provided');
    }
    if (params.gain) {
      throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.gamma) {
      throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.effects) {
      throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
    }
    const xyz =
      params.bbox && !params.tileCoord
        ? bboxToXyz(params.bbox, params.zoom, params.width)
        : {
            x: params.tileCoord.x,
            y: params.tileCoord.y,
            z: params.zoom,
          };
    const urlParams: Record<string, any> = {
      '{TileMatrix}': xyz.z,
      '{TileCol}': xyz.x,
      '{TileRow}': xyz.y,
    };

    return this.resourceURL.replace(/\{ *([\w_ -]+) *\}/g, (m: string) => urlParams[m]);
  }
}
