import { getPlanetScopeAccessToken } from '../auth';
import { LocationIdSHv3, DataProductId, BYOCSubTypes } from './const';
import { DATASET_PLANETSCOPE_LIVE } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  title?: string | null;
  description?: string | null;
  collectionId?: string | null;
  locationId?: LocationIdSHv3 | null;
  subType?: BYOCSubTypes | null;
  accessKey?: string | null;
}

export const PLANETSCOPE_LIVE_CONFIGURATIONS: any[] = [
  {
    layerId: 'TRUE_COLOR',
    title: 'True Color',
    evalscript:
      '//VERSION=3\nlet minVal = 0.0;\nlet maxVal = 0.4;\n\nlet viz = new HighlightCompressVisualizer(minVal, maxVal);\n\nfunction setup() {\n   return {\n    input: ["Red","Green","Blue","dataMask"],\n    output: { bands: 3 }\n  };\n}\n\nfunction evaluatePixel(samples) {\n    let val = [samples.Red, samples.Green, samples.Blue];\n    return viz.processList(val);\n}',
  },
];

export class PlanetScopeLiveLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_PLANETSCOPE_LIVE;
  protected accessKey: string;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
    accessKey = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
    this.accessKey = accessKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async fetchLayerParamsFromSHServiceV3(reqConfig: RequestConfiguration): Promise<any> {
    return await PLANETSCOPE_LIVE_CONFIGURATIONS.find(l => l.layerId === this.layerId);
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration,
  ): Promise<ProcessingPayload> {
    payload.input.data[datasetSeqNo]['accessToken'] = getPlanetScopeAccessToken();
    return payload;
  }
}
