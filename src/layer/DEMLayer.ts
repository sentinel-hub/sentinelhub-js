import { DATASET_AWS_DEM } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';

export class DEMLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_AWS_DEM;
}
