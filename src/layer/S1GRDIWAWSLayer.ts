import { BBox } from 'src/bbox';
import { BackscatterCoeff, PaginatedTiles } from 'src/layer/const';
import { DATASET_AWS_S1GRD_IW } from 'src/layer/dataset';

import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

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

export enum AcquisitionMode {
  IW = 'IW',
  EW = 'EW',
}

type FindTilesDatasetParameters = {
  type?: string;
  acquisitionMode?: AcquisitionMode;
  polarization?: Polarization;
  orbitDirection?: OrbitDirection;
};

export class S1GRDIWAWSLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_AWS_S1GRD_IW;

  protected polarization: Polarization;
  protected orthorectify: boolean | null = false;
  protected backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID;
  protected static acquisitionMode = AcquisitionMode.IW;

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
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    if (!polarization) {
      throw new Error('Polarization should be set');
    }
    this.polarization = polarization;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
  }

  private async updateParamsViaService(): Promise<void> {
    const params = await this.fetchLayerParamsFromSHServiceV3();
    this.orthorectify = params['orthorectify'];
    this.backscatterCoeff = params['backCoeff'];
  }

  public async getOrthorectify(): Promise<boolean> {
    if (this.orthorectify) {
      return this.orthorectify;
    }
    try {
      await this.updateParamsViaService();
      if (this.orthorectify === null) {
        throw new Error('orthorectify should not be null!');
      }
      return this.orthorectify;
    } catch (ex) {
      throw new Error(
        `Parameter 'orthorectify' is not specified and there was an error fetching it: ${ex.message}`,
      );
    }
  }

  public async getBackscatterCoeff(): Promise<BackscatterCoeff> {
    if (this.backscatterCoeff) {
      return this.backscatterCoeff;
    }
    try {
      await this.updateParamsViaService();
      if (this.backscatterCoeff === null) {
        throw new Error('backscatterCoeff should not be null!');
      }
      return this.backscatterCoeff;
    } catch (ex) {
      throw new Error(
        `Parameter 'backscatterCoeff' is not specified and there was an error fetching it: ${ex.message}`,
      );
    }
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
    orbitDirection?: OrbitDirection,
  ): Promise<PaginatedTiles> {
    const findTilesDatasetParameters: FindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      acquisitionMode: S1GRDIWAWSLayer.acquisitionMode,
      polarization: this.polarization,
      orbitDirection: orbitDirection,
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
          },
        };
      }),
      hasMore: response.data.hasMore,
    };
  }
}
