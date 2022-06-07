import { DATASET_AWS_LMSSL1 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class Landsat15AWSLMSSL1Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LMSSL1;
}
