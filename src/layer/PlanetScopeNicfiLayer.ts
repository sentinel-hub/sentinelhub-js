import { LocationIdSHv3, DataProductId, BYOCSubTypes, Link } from './const';
import { DATASET_PLANETSCOPE_NICFI } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
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

export const PLANETSCOPE_NICFI_CONFIGURATIONS: any[] = [
  {
    layerId: 'TRUE_COLOR',
    title: 'True Color',
    evalscript:
      '//VERSION=3\n\nfunction setup() {\n  return {\n    input: ["Red", "Green", "Blue"],\n    output: { bands: 3 }\n  };\n}\n\nfunction evaluatePixel(sample) {\n  return [2.5 * sample.Red, 2.5 * sample.Green, 2.5 * sample.Blue];\n}',
  },
];

export class PlanetScopeNicfiLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_PLANETSCOPE_NICFI;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async fetchLayerParamsFromSHServiceV3(reqConfig: RequestConfiguration): Promise<any> {
    return await PLANETSCOPE_NICFI_CONFIGURATIONS.find(l => l.layerId === this.layerId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    return [];
  }
}
