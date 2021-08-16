import { DATASET_AWS_LMSSL1 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

export class Landsat15AWSLMSSL1Layer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_LMSSL1;
}
