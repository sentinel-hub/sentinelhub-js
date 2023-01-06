import { RequestConfiguration } from '../utils/cancelRequests';
import { DATASET_CDAS_S2L2A } from './dataset';
import { S2L2ALayer } from './S2L2ALayer';

export class S2L2ACDASLayer extends S2L2ALayer {
  public readonly dataset = DATASET_CDAS_S2L2A;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }
}
