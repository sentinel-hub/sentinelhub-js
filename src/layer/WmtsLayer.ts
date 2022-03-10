import axios, { AxiosRequestConfig } from 'axios';

import { GetMapParams, ApiType, MimeType, MimeTypes } from './const';
import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { CACHE_CONFIG_30MIN } from '../utils/cacheHandlers';
import { getAxiosReqParams } from '../utils/cancelRequests';
import {
  bboxToXyzGrid,
  fetchLayersFromWmtsGetCapabilitiesXml,
  getMatrixSets,
  TileMatrix,
} from './wmts.utils';
import { runEffectFunctions } from '../mapDataManipulation/runEffectFunctions';
import { validateCanvasDimensions, drawBlobOnCanvas, canvasToBlob, scaleCanvasImage } from '../utils/canvas';
import { Effects } from '../mapDataManipulation/const';

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  resourceUrl?: string | null;
  matrixSet?: string | null;
}

export class WmtsLayer extends AbstractLayer {
  protected baseUrl: string;
  protected layerId: string;
  protected resourceUrl: string;
  protected matrixSet: string;
  protected tileMatrix: TileMatrix[];

  public constructor({
    baseUrl,
    layerId,
    title = null,
    description = null,
    legendUrl = null,
    resourceUrl = null,
    matrixSet = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
    this.resourceUrl = resourceUrl;
    this.matrixSet = matrixSet;
    this.tileMatrix = null;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (!this.resourceUrl) {
        const parsedLayers = await fetchLayersFromWmtsGetCapabilitiesXml(this.baseUrl, innerReqConfig);
        const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
        this.resourceUrl = layer.ResourceUrl;
      }
      if (!this.tileMatrix) {
        const matrixSets = await getMatrixSets(this.baseUrl, innerReqConfig);
        const matrixSet = matrixSets.find(set => set.id === this.matrixSet);
        if (!matrixSet) {
          throw new Error(`No matrixSet found for: ${this.matrixSet}`);
        }
        this.tileMatrix = matrixSet.tileMatrices;
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

      if (params.bbox && !params.tileCoord) {
        return await this.stitchGetMap(paramsWithoutEffects, api, innerReqConfig);
      }
      const url = this.getMapUrl(paramsWithoutEffects, api);

      const requestConfig: AxiosRequestConfig = {
        // 'blob' responseType does not work with Node.js:
        responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer',
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_30MIN),
      };
      const response = await axios.get(url, requestConfig);
      let blob = response.data;

      // apply effects:
      // support deprecated GetMapParams.gain and .gamma parameters
      // but override them if they are also present in .effects
      const effects: Effects = { gain: params.gain, gamma: params.gamma, ...params.effects };
      return await runEffectFunctions(blob, effects);
    }, reqConfig);
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMTS) {
      throw new Error('Only WMTS is supported on this layer');
    }

    if (!params.bbox && !params.tileCoord) {
      throw new Error('No bbox or x,y,z coordinates provided');
    }
    if (!this.resourceUrl) {
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

    const xyz = {
      x: params.tileCoord.x,
      y: params.tileCoord.y,
      z: params.tileCoord.z,
    };

    const urlParams: Record<string, any> = {
      '{TileMatrix}': xyz.z,
      '{TileCol}': xyz.x,
      '{TileRow}': xyz.y,
    };

    return this.resourceUrl.replace(/\{ *([\w_ -]+) *\}/g, (m: string) => urlParams[m]);
  }

  protected async stitchGetMap(
    params: GetMapParams,
    api: ApiType,
    reqConfig?: RequestConfiguration,
  ): Promise<any> {
    return await ensureTimeout(async innerReqConfig => {
      const { width: requestedImageWidth, height: requestedImageHeight, bbox } = params;
      const { nativeHeight, nativeWidth, tiles } = bboxToXyzGrid(
        bbox,
        requestedImageWidth,
        requestedImageHeight,
        this.tileMatrix,
      );

      const canvas = document.createElement('canvas');
      canvas.width = nativeWidth;
      canvas.height = nativeHeight;
      const ctx = canvas.getContext('2d');
      const isCanvasValid = await validateCanvasDimensions(canvas);
      if (!isCanvasValid) {
        throw new Error(
          `Image dimensions (${nativeWidth}x${nativeHeight}) exceed the canvas size limit for this browser.`,
        );
      }

      for (let tile of tiles) {
        const blob = await this.getMap({ ...params, tileCoord: tile }, api, innerReqConfig);
        await drawBlobOnCanvas(ctx, blob, tile.imageOffsetX, tile.imageOffsetY);
      }
      const outputFormat = (params.format === MimeTypes.JPEG_OR_PNG
        ? MimeTypes.PNG
        : params.format) as MimeType;

      const requestedSizeCanvas = await scaleCanvasImage(canvas, requestedImageWidth, requestedImageHeight);
      return await canvasToBlob(requestedSizeCanvas, outputFormat);
    }, reqConfig);
  }

  public supportsApiType(api: ApiType): boolean {
    return api === ApiType.WMTS;
  }
}
