import { BackscatterCoeff } from 'src/layer/const';
import { DATASET_EOCLOUD_S1GRD } from 'src/layer/dataset';

import { AbstractSentinelHubV1OrV2Layer } from './AbstractSentinelHubV1OrV2Layer';
import { AcquisitionMode, Polarization, Resolution } from 'src/layer/S1GRDAWSEULayer';

/*
  Note: the usual combinations are IW + DV/SV + HIGH and EW + DH/SH + MEDIUM.
*/

export class S1GRDEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
  public readonly dataset = DATASET_EOCLOUD_S1GRD;

  protected acquisitionMode: AcquisitionMode;
  protected polarization: Polarization;
  protected orthorectify: boolean | null = false;
  protected backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID;
  protected resolution: Resolution | null = null;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    title: string | null = null,
    description: string | null = null,
    acquisitionMode: AcquisitionMode | null = null,
    polarization: Polarization | null = null,
    resolution: Resolution | null = null,
    orthorectify: boolean | null = false,
    backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, title, description);
    if (!acquisitionMode || !polarization || !resolution) {
      throw new Error("Parameters acquisitionMode, polarization and resolution are mandatory");
    }
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.resolution = resolution;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
  }

  protected getEvalsource(): string {
    // ignore this.dataset.shWmsEvalsource and return the string based on acquisitionMode:
    return this.acquisitionMode === AcquisitionMode.EW ? 'S1_EW' : 'S1';
  }

  protected getFindTilesAdditionalParameters() : Record<string, string> {
    return {
      productType: 'GRD',
      acquisitionMode: this.acquisitionMode,
      polarization: this.polarization,
    };
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {};
  }
}
