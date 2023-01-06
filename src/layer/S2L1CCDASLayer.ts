import { RequestConfiguration } from '../utils/cancelRequests';
import { DATASET_CDAS_S2L1C } from './dataset';
import { S2L1CLayer } from './S2L1CLayer';

export class S2L1CCDASLayer extends S2L1CLayer {
  public readonly dataset = DATASET_CDAS_S2L1C;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }
}
