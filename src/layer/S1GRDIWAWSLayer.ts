import { DATASET_AWS_S1GRD_IW } from 'src/layer/dataset';
import { AcquisitionMode, AbstractS1GRDAWSLayer } from 'src/layer/AbstractS1GRDAWSLayer';

export class S1GRDIWAWSLayer extends AbstractS1GRDAWSLayer {
  public readonly dataset = DATASET_AWS_S1GRD_IW;
  protected acquisitionMode = AcquisitionMode.IW;
}
