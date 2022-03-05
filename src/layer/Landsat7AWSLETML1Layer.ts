import { DATASET_AWS_LETML1 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

export class Landsat7AWSLETML1Layer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_LETML1;
}
