import { BBox } from 'src/bbox';
import { BackscatterCoeff, PaginatedTiles } from 'src/layer/const';
import { ProcessingPayload } from 'src/layer/processing';

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
  SV = 'SV',
  DH = 'DH',
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
  type?: string;
  acquisitionMode?: AcquisitionMode;
  polarization?: Polarization;
  orbitDirection?: OrbitDirection;
  resolution?: Resolution;
};

export class AbstractS1GRDAWSLayer extends AbstractSentinelHubV3Layer {
  protected polarization: Polarization;
  protected orthorectify: boolean | null = false;
  protected backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID;
  protected acquisitionMode: AcquisitionMode | null = null;
  protected resolution: Resolution | null = null;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    polarization: Polarization | null = null,
    orthorectify: boolean | null = false,
    backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID,
    resolution: Resolution | null = null,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.polarization = polarization;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
    this.resolution = resolution;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    const layerParams = await this.fetchLayerParamsFromSHServiceV3();

    this.polarization = layerParams['polarization'];
    this.backscatterCoeff = layerParams['backCoeff'];
    this.orthorectify = layerParams['orthorectify'];

    payload.input.data[0].dataFilter.polarization = this.polarization;
    payload.input.data[0].processing.backCoeff = this.backscatterCoeff;
    payload.input.data[0].processing.orthorectify = this.orthorectify;
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
