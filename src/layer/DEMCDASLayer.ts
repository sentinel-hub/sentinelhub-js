import { DATASET_CDAS_DEM } from './dataset';
import { AbstractDEMLayer, ConstructorParameters } from './AbstractDEMLayer';
import { DEMInstanceType } from './const';

export class DEMCDASLayer extends AbstractDEMLayer {
  public readonly dataset = DATASET_CDAS_DEM;

  public constructor({ demInstance, ...rest }: ConstructorParameters) {
    super(rest);

    if (demInstance === DEMInstanceType.MAPZEN) {
      throw new Error(`DEMCDASLayer does not support demInstance ${demInstance}`);
    }

    this.demInstance = demInstance;
  }
}
