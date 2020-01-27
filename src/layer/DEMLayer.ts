import { DATASET_AWS_DEM } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class DEMLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_AWS_DEM;
}
