import { DATASET_AWS_LTML2 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class Landsat45AWSLTML2Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LTML2;

  protected getPreviewUrl(): string | null {
    return null;
  }
}
