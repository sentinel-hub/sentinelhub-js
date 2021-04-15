import { DATASET_AWSUS_DEM } from './dataset';
import { AbstractDEMLayer, ConstructorParameters } from './AbstractDEMLayer';
import { DEMInstanceType } from './const';

export class DEMAWSUSLayer extends AbstractDEMLayer {
  public readonly dataset = DATASET_AWSUS_DEM;

  public constructor({ demInstance, ...rest }: ConstructorParameters) {
    super(rest);
    if (!demInstance || demInstance === DEMInstanceType.MAPZEN) {
      this.demInstance = DEMInstanceType.MAPZEN;
    } else {
      throw new Error(`DEMAWSUSLayer does not support demInstance ${demInstance}`);
    }
  }
}
