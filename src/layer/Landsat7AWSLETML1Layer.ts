import { DATASET_AWS_LETML1 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class Landsat7AWSLETML1Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LETML1;
}
