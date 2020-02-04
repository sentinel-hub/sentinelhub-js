import { BBox } from 'src/bbox';
import { BackscatterCoeff, PaginatedTiles } from 'src/layer/const';
import { ProcessingPayload } from 'src/layer/processing';
import { DATASET_AWSEU_S1GRD } from 'src/layer/dataset';

import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

/*
  Note: the usual combinations are IW + DV/SV + HIGH and EW + DH/SH + MEDIUM.
*/

export enum AcquisitionMode {
  IW = 'IW',
  EW = 'EW',
}

export enum Polarization {
  DV = 'DV',
  SH = 'SH',
  DH = 'DH',
  SV = 'SV',
}

export enum OrbitDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum Resolution {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
}

type S1GRDFindTilesDatasetParameters = {
  type: string;
  acquisitionMode: AcquisitionMode;
  polarization: Polarization;
  orbitDirection?: OrbitDirection;
  resolution?: Resolution;
};

export class S1GRDAWSEULayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_AWSEU_S1GRD;

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
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    acquisitionMode: AcquisitionMode | null = null,
    polarization: Polarization | null = null,
    resolution: Resolution | null = null,
    orthorectify: boolean | null = false,
    backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.resolution = resolution;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    if (this.polarization === null || this.acquisitionMode === null || this.resolution === null) {
      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "Parameters polarization, acquisitionMode and/or resolution are not set and can't be fetched from service because instanceId and layerId are not available",
        );
      }
      const layerParams = await this.fetchLayerParamsFromSHServiceV3();

      this.acquisitionMode = layerParams['acquisitionMode'];
      this.polarization = layerParams['polarization'];
      this.resolution = layerParams['resolution'];
      this.backscatterCoeff = layerParams['backCoeff'];
      this.orthorectify = layerParams['orthorectify'];

      payload.input.data[0].dataFilter.acquisitionMode = this.acquisitionMode;
      payload.input.data[0].dataFilter.polarization = this.polarization;
      payload.input.data[0].dataFilter.resolution = this.resolution;
      payload.input.data[0].processing.backCoeff = this.backscatterCoeff;
      payload.input.data[0].processing.orthorectify = this.orthorectify;
    }
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    orbitDirection?: OrbitDirection,
  ): Promise<PaginatedTiles> {
    const findTilesDatasetParameters: S1GRDFindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      acquisitionMode: this.acquisitionMode,
      polarization: this.polarization,
      orbitDirection: orbitDirection,
      resolution: this.resolution,
    };

    const response = await this.fetchTiles(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      null,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.dataGeometry,
          sensingTime: tile.sensingTime,
          meta: {
            orbitDirection: tile.orbitDirection,
            polarization: tile.polarization,
            acquisitionMode: tile.acquisitionMode,
            resolution: tile.resolution,
          },
        };
      }),
      hasMore: response.data.hasMore,
    };
  }
}
