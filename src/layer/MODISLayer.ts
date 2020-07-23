import { DATASET_MODIS } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';

export class MODISLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_MODIS;
}
