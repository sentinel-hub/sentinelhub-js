import { DATASET_AWS_LOTL1 } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';

export class Landsat8AWSLOTL1Layer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_LOTL1;
}
