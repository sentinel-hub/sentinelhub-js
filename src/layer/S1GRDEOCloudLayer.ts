import { BackscatterCoeff } from 'src/layer/const';
import { DATASET_EOCLOUD_S1GRD } from 'src/layer/dataset';

import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';
import { AcquisitionMode, Polarization, Resolution, OrbitDirection } from 'src/layer/S1GRDAWSEULayer';

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
  protected orbitDirection: OrbitDirection | null = null;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    title: string | null = null,
    description: string | null = null,
    acquisitionMode: AcquisitionMode | null = null,
    polarization: Polarization | null = null,
    orbitDirection: OrbitDirection | null = null,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, title, description);
    // it is not possible to determine these parameters by querying the service, because there
    // is no endpoint which would return them:
    if ((evalscript || evalscriptUrl) && (!acquisitionMode || !polarization)) {
      throw new Error('Parameters acquisitionMode and polarization are mandatory when using evalscript');
    }
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.orbitDirection = orbitDirection;
  }

  public static makeLayer(
    layerInfo: any,
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): S1GRDEOCloudLayer {
    let acquisitionMode = null;
    let polarization = null;
    switch (layerInfo.settings.datasourceName) {
      case 'S1':
        acquisitionMode = AcquisitionMode.IW;
        polarization = Polarization.DV; // SV is not available on EO Cloud
        break;
      case 'S1_EW':
        acquisitionMode = AcquisitionMode.EW;
        polarization = Polarization.DH;
        break;
      case 'S1_EW_SH':
        acquisitionMode = AcquisitionMode.EW;
        polarization = Polarization.SH;
        break;
      default:
        throw new Error(`Unknown datasourceName (${layerInfo.settings.datasourceName})`);
    }
    return new S1GRDEOCloudLayer(
      instanceId,
      layerId,
      evalscript,
      evalscriptUrl,
      title,
      description,
      acquisitionMode,
      polarization,
    );
  }

  protected getEvalsource(): string {
    // ignore this.dataset.shWmsEvalsource and return the string based on acquisitionMode:
    if (this.acquisitionMode === AcquisitionMode.IW && this.polarization === Polarization.DV) {
      // note that on EO Cloud, for IW acquisition mode only DV is available (SV is not available)
      return 'S1';
    }
    if (this.acquisitionMode === AcquisitionMode.EW && this.polarization === Polarization.DH) {
      return 'S1_EW';
    }
    if (this.acquisitionMode === AcquisitionMode.EW && this.polarization === Polarization.SH) {
      return 'S1_EW_SH';
    }
    throw new Error(
      `This combination of acquisition mode and polarization (${this.acquisitionMode} / ${
        this.polarization
      }) is not available on EO Cloud`,
    );
  }

  protected getFindTilesAdditionalParameters(): Record<string, any> {
    const result = {
      productType: 'GRD',
      acquisitionMode: this.acquisitionMode,
      polarization: this.polarization,
    };
    if (this.orbitDirection !== null) {
      result.orbitDirection = this.orbitDirection;
    }
    return result;
  }
}
