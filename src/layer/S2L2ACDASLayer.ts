import { DATASET_CDAS_S2L2A } from './dataset';
import { S2L2ALayer } from './S2L2ALayer';

export class S2L2ACDASLayer extends S2L2ALayer {
  public readonly dataset = DATASET_CDAS_S2L2A;
}
