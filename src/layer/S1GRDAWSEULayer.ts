import moment from 'moment';

import { BBox } from '../bbox';

import {
  BackscatterCoeff,
  DEMInstanceTypeOrthorectification,
  PaginatedTiles,
  OrbitDirection,
  Link,
  LinkType,
  DataProductId,
  FindTilesAdditionalParameters,
} from './const';
import { ProcessingPayload } from './processing';
import { DATASET_AWSEU_S1GRD } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
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

export enum SpeckleFilterType {
  NONE = 'NONE',
  LEE = 'LEE',
}

export type SpeckleFilter = {
  type: SpeckleFilterType;
  windowSizeX: number;
  windowSizeY: number;
};

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  acquisitionMode?: AcquisitionMode | null;
  polarization?: Polarization | null;
  resolution?: Resolution | null;
  orthorectify?: boolean | null;
  demInstanceType?: DEMInstanceTypeOrthorectification | null;
  backscatterCoeff?: BackscatterCoeff | null;
  orbitDirection?: OrbitDirection | null;
  speckleFilter?: SpeckleFilter | null;
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
  public demInstanceType: DEMInstanceTypeOrthorectification | null = DEMInstanceTypeOrthorectification.MAPZEN;
  public backscatterCoeff: BackscatterCoeff | null = BackscatterCoeff.GAMMA0_ELLIPSOID;
  public speckleFilter: SpeckleFilter | null;

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
    demInstanceType = DEMInstanceTypeOrthorectification.MAPZEN,
    backscatterCoeff = BackscatterCoeff.GAMMA0_ELLIPSOID,
    orbitDirection = null,
    speckleFilter = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl });
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.resolution = resolution;
    this.orthorectify = orthorectify;
    this.demInstanceType = demInstanceType;
    this.backscatterCoeff = backscatterCoeff;
    this.orbitDirection = orbitDirection;
    this.speckleFilter = speckleFilter;
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
      this.orbitDirection = layerParams['orbitDirection'] ? layerParams['orbitDirection'] : null;
      if (!this.orthorectify) {
        this.orthorectify = layerParams['orthorectify']
      }
      if (!this.demInstanceType) {
        this.demInstanceType = layerParams['demInstance'];
      }
      if (!this.speckleFilter) {
        this.speckleFilter = layerParams['speckleFilter'];
      }
      this.legend = layerParams['legend'] ? layerParams['legend'] : null;
      if (!this.evalscript) {
        this.evalscript = layerParams['evalscript'] ? layerParams['evalscript'] : null;
      }
      if (!this.mosaickingOrder && layerParams.mosaickingOrder) {
        this.mosaickingOrder = layerParams.mosaickingOrder;
      }
      if (!this.upsampling && layerParams.upsampling) {
        this.upsampling = layerParams.upsampling;
      }
      if (!this.downsampling && layerParams.downsampling) {
        this.downsampling = layerParams.downsampling;
      }
      // this is a hotfix for `supportsApiType()` not having enough information - should be fixed properly later:
      this.dataProduct = layerParams['dataProduct'] ? layerParams['dataProduct'] : null;
    }, reqConfig);
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
    reqConfig?: RequestConfiguration,
  ): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);

    payload.input.data[datasetSeqNo].dataFilter.acquisitionMode = this.acquisitionMode;
    payload.input.data[datasetSeqNo].dataFilter.polarization = this.polarization;
    payload.input.data[datasetSeqNo].dataFilter.resolution = this.resolution;
    if (this.orbitDirection !== null) {
      payload.input.data[datasetSeqNo].dataFilter.orbitDirection = this.orbitDirection;
    }
    payload.input.data[datasetSeqNo].processing.backCoeff = this.backscatterCoeff;
    payload.input.data[datasetSeqNo].processing.orthorectify = this.orthorectify;
    if (this.orthorectify === true) {
      payload.input.data[datasetSeqNo].processing.demInstance = this.demInstanceType;
    }
    payload.input.data[datasetSeqNo].processing.speckleFilter = this.speckleFilter;
    return payload;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: {
          tileId: tile.id,
          orbitDirection: tile.orbitDirection,
          polarization: tile.polarization,
          acquisitionMode: tile.acquisitionMode,
          resolution: tile.resolution,
        },
        links: this.getTileLinks(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    if (!feature) {
      return {};
    }
    return {
      orbitDirection: feature.properties['sat:orbit_state'].toUpperCase(),
      polarization: feature.properties['polarization'],
      acquisitionMode: feature.properties['sar:instrument_mode'],
      resolution: feature.properties['resolution'],
    };
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: S1GRDFindTilesDatasetParameters = {
      type: this.dataset.datasetParametersType,
      acquisitionMode: this.acquisitionMode,
      polarization: this.polarization,
      orbitDirection: this.orbitDirection,
      resolution: this.resolution,
    };

    return {
      maxCloudCoverPercent: null,
      datasetParameters: findTilesDatasetParameters,
    };
  }

  protected async findTilesInner(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded(reqConfig);
    const response = await super.findTilesInner(bbox, fromTime, toTime, maxCount, offset, reqConfig);

    return response;
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

  protected createCatalogPayloadQuery(
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Record<string, any> {
    let result = { ...super.createCatalogPayloadQuery(maxCloudCoverPercent, datasetParameters) };

    if (datasetParameters && datasetParameters.acquisitionMode) {
      result['sar:instrument_mode'] = {
        eq: datasetParameters.acquisitionMode,
      };
    }

    if (datasetParameters && datasetParameters.polarization) {
      result['polarization'] = {
        eq: datasetParameters.polarization,
      };
    }

    if (datasetParameters && datasetParameters.resolution) {
      result['resolution'] = {
        eq: datasetParameters.resolution,
      };
    }

    if (datasetParameters && datasetParameters.orbitDirection) {
      result['sat:orbit_state'] = {
        eq: datasetParameters.orbitDirection,
      };
    }

    return result;
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    // for some reason data link is stored differently as in other datasets (s3 instead of data)
    if (assets.s3 && assets.s3.href) {
      result.push({ target: assets.s3.href, type: LinkType.AWS });
    }
    return result;
  }
}
