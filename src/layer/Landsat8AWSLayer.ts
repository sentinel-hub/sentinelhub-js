import { DATASET_AWS_L8L1C } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';

export class Landsat8AWSLayer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_L8L1C;
}
