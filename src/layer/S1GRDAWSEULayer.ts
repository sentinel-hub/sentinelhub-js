import axios from 'axios';
import moment from 'moment';

import { BBox } from 'src/bbox';
import { CRS_EPSG4326 } from 'src/crs';
import { BackscatterCoeff, PaginatedTiles, OrbitDirection } from 'src/layer/const';
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
    acquisitionMode = null,
    polarization = null,
    resolution = null,
    orthorectify = false,
    backscatterCoeff = BackscatterCoeff.GAMMA0_ELLIPSOID,
    orbitDirection = null,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description });
    this.acquisitionMode = acquisitionMode;
    this.polarization = polarization;
    this.resolution = resolution;
    this.orthorectify = orthorectify;
    this.backscatterCoeff = backscatterCoeff;
    this.orbitDirection = orbitDirection;
  }

  public async updateLayerFromServiceIfNeeded(): Promise<void> {
    if (this.polarization !== null && this.acquisitionMode !== null && this.resolution !== null) {
      return;
    }
    if (this.instanceId === null || this.layerId === null) {
      throw new Error(
        "One or more of these parameters (polarization, acquisitionMode, resolution) \
        are not set and can't be fetched from service because instanceId and layerId are not available",
      );
    }
    const layerParams = await this.fetchLayerParamsFromSHServiceV3();

    this.acquisitionMode = layerParams['acquisitionMode'];
    this.polarization = layerParams['polarization'];
    this.resolution = layerParams['resolution'];
    this.backscatterCoeff = layerParams['backCoeff'];
    this.orthorectify = layerParams['orthorectify'];
    this.orbitDirection = layerParams['orbitDirection'] ? layerParams['orbitDirection'] : null;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    await this.updateLayerFromServiceIfNeeded();

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
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded();

    if (!this.dataset.searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    if (bbox.crs !== CRS_EPSG4326) {
      throw new Error('Currently, only EPSG:4326 is supported when using findTiles with this dataset');
    }

    // https://git.sinergise.com/sentinel-core/java/-/wikis/Catalog
    const payload: any = {
      bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
      datetime: `${moment.utc(fromTime).toISOString()}/${moment.utc(toTime).toISOString()}`,
      collections: ['sentinel-1-grd'],
      limit: maxCount,
      query: {
        'sar:instrument_mode': {
          eq: this.acquisitionMode,
        },
        // "sar:polarizations" (with trailing "s") is an array (as per specs) and can't be searched for. Instead,
        // we use "sar:polarization" which is a string with 4 possible values ("SH", "SV", "DV" and "DH") and
        // which allows searching:
        's1:polarization': {
          eq: this.polarization,
        },
      },
    };
    if (this.orbitDirection !== null) {
      payload.query['sat:orbit_state'] = {
        eq: this.orbitDirection.toLowerCase(),
      };
    }
    //TODO: add resolution:
    // if (this.resolution !== null) {
    //   payload.query["s1:resolution"] = {
    //     eq: this.resolution,
    //   };
    // }
    if (offset > 0) {
      payload.next = offset;
    }

    const response = await axios.post(this.dataset.searchIndexUrl, payload);

    return {
      tiles: response.data.features.map((feature: Record<string, any>) => ({
        geometry: feature.geometry,
        sensingTime: moment.utc(feature.properties.datetime).toDate(),
        meta: {
          orbitDirection: feature.properties['sat:orbit_state'].toUpperCase(),
          polarization: feature.properties['s1:polarization'],
          acquisitionMode: feature.properties['sar:instrument_mode'],
          //TODO: resolution: ...,
        },
      })),
      hasMore: response.data['search:metadata'].next ? true : false,
    };
  }

  protected getFindDatesAdditionalParameters(): Record<string, any> {
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
}
