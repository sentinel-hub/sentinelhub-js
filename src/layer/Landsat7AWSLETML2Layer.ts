import { DATASET_AWS_LETML2 } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';

export class Landsat7AWSLETML2Layer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_LETML2;
}
