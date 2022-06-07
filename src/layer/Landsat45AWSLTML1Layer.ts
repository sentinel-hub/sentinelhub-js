import { DATASET_AWS_LTML1 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class Landsat45AWSLTML1Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LTML1;
}
