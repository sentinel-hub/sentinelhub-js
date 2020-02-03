import { DATASET_AWS_S1GRD_EW } from 'src/layer/dataset';
import { AcquisitionMode, AbstractS1GRDAWSLayer } from 'src/layer/AbstractS1GRDAWSLayer';

export class S1GRDEWAWSLayer extends AbstractS1GRDAWSLayer {
  public readonly dataset = DATASET_AWS_S1GRD_EW;
  protected acquisitionMode = AcquisitionMode.EW;
}
