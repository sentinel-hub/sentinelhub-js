import { DATASET_AWS_DEM } from './dataset';
import { AbstractDEMLayer } from './AbstractDEMLayer';

export class DEMLayerAWSUS extends AbstractDEMLayer {
  public readonly dataset = DATASET_AWS_DEM;
}
