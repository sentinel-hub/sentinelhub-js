import { DATASET_EOCLOUD_LANDSAT8 } from 'src/layer/dataset';
import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';

export class Landsat8EOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
  public readonly dataset = DATASET_EOCLOUD_LANDSAT8;
}
