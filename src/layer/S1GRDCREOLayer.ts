import { DATASET_CREODIAS_S1GRD } from './dataset';
import { S1GRDAWSEULayer } from './S1GRDAWSEULayer';

export class S1GRDCREOLayer extends S1GRDAWSEULayer {
  public readonly dataset = DATASET_CREODIAS_S1GRD;
}
