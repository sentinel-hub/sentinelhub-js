import { DATASET_CDAS_S2L1C } from './dataset';
import { S2L1CLayer } from './S2L1CLayer';

export class S2L1CCDASLayer extends S2L1CLayer {
  public readonly dataset = DATASET_CDAS_S2L1C;
}
