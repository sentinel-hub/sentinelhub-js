import { DATASET_AWS_LETML2 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';

export class Landsat7AWSLETML2Layer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_LETML2;
}
