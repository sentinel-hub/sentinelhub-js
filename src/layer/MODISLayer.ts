import { DATASET_MODIS } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class MODISLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_MODIS;
}
