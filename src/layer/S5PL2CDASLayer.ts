import { DATASET_CDAS_S5PL2 } from './dataset';
import { S5PL2Layer } from './S5PL2Layer';

export class S5PL2CDASLayer extends S5PL2Layer {
  public readonly dataset = DATASET_CDAS_S5PL2;

  public async getStats(): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }
}
