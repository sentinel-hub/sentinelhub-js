import { RequestConfiguration } from '../utils/cancelRequests';
import { DATASET_CDAS_S1GRD } from './dataset';
import { S1GRDAWSEULayer } from './S1GRDAWSEULayer';

export class S1GRDCDASLayer extends S1GRDAWSEULayer {
  public readonly dataset = DATASET_CDAS_S1GRD;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }
}
