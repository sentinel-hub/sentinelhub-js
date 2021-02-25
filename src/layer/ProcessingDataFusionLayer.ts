import { BBox } from '../bbox';
import { GetMapParams, Interpolator, PreviewMode, ApiType, PaginatedTiles, MosaickingOrder } from './const';
import {
  createProcessingPayload,
  convertPreviewToString,
  processingGetMap,
  ProcessingPayloadDatasource,
} from './processing';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';

import { Effects } from '../mapDataManipulation/const';
import { runEffectFunctions } from '../mapDataManipulation/runEffectFunctions';

/*
  This layer allows using Processing API "data fusion". It takes a list of layers and
  their accompanying parameters and allows us to call `getMap`. Note that `find*()`
  methods wouldn't make sense and are thus disabled.
*/
interface ConstructorParameters {
  evalscript: string | null;
  evalscriptUrl?: string | null;
  layers: DataFusionLayerInfo[];
  title?: string | null;
  description?: string | null;
}

export type DataFusionLayerInfo = {
  layer: AbstractSentinelHubV3Layer;
  id?: string;
  fromTime?: Date;
  toTime?: Date;
  preview?: PreviewMode;
  mosaickingOrder?: MosaickingOrder;
  upsampling?: Interpolator;
  downsampling?: Interpolator;
};

export const DEFAULT_SH_SERVICE_HOSTNAME = 'https://services.sentinel-hub.com/';

export class ProcessingDataFusionLayer extends AbstractSentinelHubV3Layer {
  protected layers: DataFusionLayerInfo[];

  public constructor({
    title = null,
    description = null,
    evalscript = null,
    evalscriptUrl = null,
    layers,
  }: ConstructorParameters) {
    super({ title, description, evalscript, evalscriptUrl });
    this.layers = layers;
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    const getMapValue = await ensureTimeout(async innerReqConfig => {
      if (api !== ApiType.PROCESSING) {
        throw new Error(`Only API type "PROCESSING" is supported`);
      }

      await this.fetchEvalscriptUrlIfNeeded(innerReqConfig);

      // when constructing the payload, we just take the first layer - we will rewrite its info later:
      const bogusFirstLayer = this.layers[0].layer;
      let payload = createProcessingPayload(bogusFirstLayer.dataset, params, this.evalscript);

      // replace payload.input.data with information from this.layers:
      payload.input.data = [];
      for (let i = 0; i < this.layers.length; i++) {
        const layerInfo = this.layers[i];
        let datasource: ProcessingPayloadDatasource = {
          dataFilter: {
            timeRange: {
              from: layerInfo.fromTime ? layerInfo.fromTime.toISOString() : params.fromTime.toISOString(),
              to: layerInfo.toTime ? layerInfo.toTime.toISOString() : params.toTime.toISOString(),
            },
            mosaickingOrder: MosaickingOrder.MOST_RECENT,
          },
          processing: {},
          type: layerInfo.layer.dataset.shProcessingApiDatasourceAbbreviation,
        };

        if (layerInfo.id !== undefined) {
          datasource.id = layerInfo.id;
        }

        if (layerInfo.preview !== undefined) {
          datasource.dataFilter.previewMode = convertPreviewToString(layerInfo.preview);
        } else if (params.preview !== undefined) {
          datasource.dataFilter.previewMode = convertPreviewToString(params.preview);
        }

        if (layerInfo.layer.mosaickingOrder) {
          datasource.dataFilter.mosaickingOrder = layerInfo.layer.mosaickingOrder;
        }

        // note that we should be using _updateProcessingGetMapPayload or sth. similar here, this is just a
        // temporary band-aid which lets us quickly use datafusion:
        if (layerInfo.layer.upsampling) {
          datasource.processing.upsampling = layerInfo.layer.upsampling;
        }
        if (layerInfo.layer.downsampling) {
          datasource.processing.downsampling = layerInfo.layer.downsampling;
        }
        if (
          (layerInfo.layer as any).orthorectify !== undefined &&
          (layerInfo.layer as any).orthorectify !== null
        ) {
          datasource.processing.orthorectify = (layerInfo.layer as any).orthorectify;
          if ((layerInfo.layer as any).orthorectify) {
            datasource.processing.demInstanceType = (layerInfo.layer as any).demInstanceType;
          }
        }

        payload.input.data.push(datasource);
      }

      // If all layers share the common endpoint, it is used for the request.
      // However, data fusion only works reliably using services.sentinel-hub if data is deployed on different endpoints
      let shServiceHostname;
      if (
        this.layers.every(
          layer => layer.layer.dataset.shServiceHostname === bogusFirstLayer.dataset.shServiceHostname,
        )
      ) {
        shServiceHostname = bogusFirstLayer.dataset.shServiceHostname;
      } else {
        shServiceHostname = DEFAULT_SH_SERVICE_HOSTNAME;
      }

      let blob = await processingGetMap(shServiceHostname, payload, innerReqConfig);

      // apply effects:
      // support deprecated GetMapParams.gain and .gamma parameters
      // but override them if they are also present in .effects
      const effects: Effects = { gain: params.gain, gamma: params.gamma, ...params.effects };
      blob = await runEffectFunctions(blob, effects);

      return blob;
    }, reqConfig);
    return getMapValue;
  }

  public supportsApiType(api: ApiType): boolean {
    return api === ApiType.PROCESSING;
  }

  public async findTiles(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    throw new Error('Not supported - use individual layers when searching for tiles or flyovers');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    throw new Error('Not supported - use individual layers when searching for available dates');
  }
}
