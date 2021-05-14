import { DATASET_AWS_LTML1 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

export class Landsat45AWSLTML1Layer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_LTML1;
}
