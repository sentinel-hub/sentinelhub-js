import { DATASET_AWS_LOTL2 } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';

export class Landsat8AWSLOTL2Layer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_LOTL2;

  protected getPreviewUrl(): string | null {
    return null;
  }
}
