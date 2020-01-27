import { DATASET_AWS_L8L1C } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class Landsat8AWSLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_AWS_L8L1C;
}
