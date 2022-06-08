import { DATASET_AWS_LETML2 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class Landsat7AWSLETML2Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LETML2;

  protected getPreviewUrl(): string | null {
    return null;
  }
}
