import { DATASET_S2L1C } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

export class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L1C;
}
