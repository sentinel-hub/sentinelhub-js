import { DATASET_CDAS_S1GRD } from './dataset';
import { S1GRDAWSEULayer } from './S1GRDAWSEULayer';

export class S1GRDCDASLayer extends S1GRDAWSEULayer {
  public readonly dataset = DATASET_CDAS_S1GRD;
}
