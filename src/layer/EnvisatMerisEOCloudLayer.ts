import { DATASET_EOCLOUD_ENVISAT_MERIS } from 'src/layer/dataset';

import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';

export class EnvisatMerisEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
  public readonly dataset = DATASET_EOCLOUD_ENVISAT_MERIS;

  public static makeLayer(
    layerInfo: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): EnvisatMerisEOCloudLayer {
    return new EnvisatMerisEOCloudLayer(instanceId, layerId, evalscript, evalscriptUrl, title, description);
  }
}
