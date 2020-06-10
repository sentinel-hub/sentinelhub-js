import moment from 'moment';

import { BBox } from 'src/bbox';

import { BackscatterCoeff, PaginatedTiles, OrbitDirection, Link, LinkType } from 'src/layer/const';
import { ProcessingPayload } from 'src/layer/processing';
import { DATASET_AWSEU_S1GRD } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { RequestConfiguration } from 'src/utils/cancelRequests';
import { ensureTimeout } from 'src/utils/ensureTimeout';
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

export enum Resolution {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
}

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  acquisitionMode?: AcquisitionMode | null;
  polarization?: Polarization | null;
  resolution?: Resolution | null;
  orthorectify?: boolean | null;
  backscatterCoeff?: BackscatterCoeff | null;
  orbitDirection?: OrbitDirection | null;
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

  public acquisitionMode: AcquisitionMode;
  public polarization: Polarization;
  public resolution: Resolution | null = null;
  public orbitDirection: OrbitDirection | null = null;
  public orthorectify: boolean | null = false;
  public backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    dataProduct = null,
    title = null,
    description = null,
    legendUrl = null,
    acquisitionMode = null,
    polarization = null,
    resolution = null,
    orthorectify = false,
    backscatterCoeff = BackscatterCoeff.GAMMA0_ELLIPSOID,
    orbitDirection = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl });
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.resolution = resolution;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
    this.orbitDirection = orbitDirection;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    await ensureTimeout(async innerReqConfig => {
      if (this.polarization !== null && this.acquisitionMode !== null && this.resolution !== null) {
        return;
      }
      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "One or more of these parameters (polarization, acquisitionMode, resolution) \
          are not set and can't be fetched from service because instanceId and layerId are not available",
        );
      }
      const layerParams = await this.fetchLayerParamsFromSHServiceV3(innerReqConfig);

      this.acquisitionMode = layerParams['acquisitionMode'];
      this.polarization = layerParams['polarization'];
      this.resolution = layerParams['resolution'];
      this.backscatterCoeff = layerParams['backCoeff'];
      this.orthorectify = layerParams['orthorectify'];
      this.orbitDirection = layerParams['orbitDirection'] ? layerParams['orbitDirection'] : null;
      this.legend = layerParams['legend'] ? layerParams['legend'] : null;
      // this is a hotfix for `supportsApiType()` not having enough information - should be fixed properly later:
      this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
    }, reqConfig);
  }

  protected async updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    reqConfig: RequestConfiguration,
  ): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);

    payload.input.data[0].dataFilter.acquisitionMode = this.acquisitionMode;
    payload.input.data[0].dataFilter.polarization = this.polarization;
    payload.input.data[0].dataFilter.resolution = this.resolution;
    if (this.orbitDirection !== null) {
      payload.input.data[0].dataFilter.orbitDirection = this.orbitDirection;
    }
    payload.input.data[0].processing.backCoeff = this.backscatterCoeff;
    payload.input.data[0].processing.orthorectify = this.orthorectify;
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    const tiles = await ensureTimeout(async innerReqConfig => {
      await this.updateLayerFromServiceIfNeeded(innerReqConfig);

      const findTilesDatasetParameters: S1GRDFindTilesDatasetParameters = {
        type: this.dataset.datasetParametersType,
        acquisitionMode: this.acquisitionMode,
        polarization: this.polarization,
        orbitDirection: this.orbitDirection,
        resolution: this.resolution,
      };
      const response = await this.fetchTiles(
        this.dataset.searchIndexUrl,
        bbox,
        fromTime,
        toTime,
        maxCount,
        offset,
        innerReqConfig,
        null,
        findTilesDatasetParameters,
      );
      return {
        tiles: response.data.tiles.map(tile => ({
          geometry: tile.dataGeometry,
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: {
            orbitDirection: tile.orbitDirection,
            polarization: tile.polarization,
            acquisitionMode: tile.acquisitionMode,
            resolution: tile.resolution,
          },
          links: this.getTileLinks(tile),
        })),
        hasMore: response.data.hasMore,
      };
    }, reqConfig);
    return tiles;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
        acquisitionMode: this.acquisitionMode,
        polarization: this.polarization,
        resolution: this.resolution,
      },
    };
    if (this.orbitDirection !== null) {
      result.datasetParameters.orbitDirection = this.orbitDirection;
    }
    return result;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
    ];
  }
}
