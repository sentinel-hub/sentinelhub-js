import { Polygon, MultiPolygon } from '@turf/helpers';

import { BBox } from '../bbox';
import { CRS, CRS_IDS } from '../crs';
import { Effects } from '../mapDataManipulation/const';
import { StatisticalApiResponse } from '../statistics/const';

/**
 * Specifies the content that should be fetched (area, time or time interval, modifiers, output format,...).
 */
export type GetMapParams = {
  bbox: BBox;
  /** Start of the time interval for which the images are fetched. If null, only `toTime` parameter will be used. */
  fromTime: Date | null;
  /** End of the time interval for which the images are fetched. If `fromTime` is null, only this parameter will be used to set time. */
  toTime: Date;
  format: MimeType | FormatJpegOrPng;
  resx?: string; // either resx + resy or width + height must be specified
  resy?: string;
  width?: number;
  height?: number;
  // optional additional parameters:
  preview?: PreviewMode;
  geometry?: Polygon | MultiPolygon;
  crs?: CRS;
  quality?: number;
  gain?: number;
  gamma?: number;
  effects?: Effects;
  nicename?: string;
  showlogo?: boolean;
  bgcolor?: string;
  transparent?: boolean;
  temporal?: boolean;
  upsampling?: Interpolator;
  downsampling?: Interpolator;
  // Processing API supports setting multiple output responses, which are then returned as TAR archive.
  // Sentinelhub-js can't deal with manipulating files inside the tar yet,
  // so we only allow setting one output response id.
  outputResponseId?: string;
  tileCoord?: {
    x: number;
    y: number;
    z: number;
  };
  // and any that we don't know about, but might have been passed to us through legacy methods:
  unknown?: {
    [key: string]: string;
  };
};

export type OverrideGetMapParams = Partial<GetMapParams>;

export enum Interpolator {
  BILINEAR = 'BILINEAR',
  BICUBIC = 'BICUBIC',
  LANCZOS = 'LANCZOS',
  BOX = 'BOX',
  NEAREST = 'NEAREST',
}

export enum PreviewMode {
  DETAIL = 0,
  PREVIEW = 1,
  EXTENDED_PREVIEW = 2,
}

export enum MosaickingOrder {
  MOST_RECENT = 'mostRecent',
  LEAST_RECENT = 'leastRecent',
  LEAST_CC = 'leastCC',
}

export enum ApiType {
  WMS = 'wms',
  WMTS = 'wmts',
  PROCESSING = 'processing',
}

export enum OrbitDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum BackscatterCoeff {
  BETA0 = 'BETA0',
  GAMMA0_ELLIPSOID = 'GAMMA0_ELLIPSOID',
  SIGMA0_ELLIPSOID = 'SIGMA0_ELLIPSOID',
  GAMMA0_TERRAIN = 'GAMMA0_TERRAIN',
}

export enum LinkType {
  EOCLOUD = 'eocloud',
  AWS = 'aws',
  PREVIEW = 'preview',
  CREODIAS = 'creodias',
  SCIHUB = 'scihub',
}

export type Link = {
  target: string;
  type: LinkType;
};

export type Tile = {
  geometry: Polygon | MultiPolygon;
  sensingTime: Date;
  meta: Record<string, any>;
  links?: Link[];
};

export type PaginatedTiles = {
  tiles: Tile[];
  hasMore: boolean;
};

export type FlyoverInterval = {
  fromTime: Date;
  toTime: Date;
  coveragePercent: number;
  meta: Record<string, any>;
};

export type MimeType =
  | 'application/json'
  | 'text/xml'
  | 'image/png'
  | 'image/jpeg'
  | 'image/tiff'
  | 'image/tiff;depth=8'
  | 'image/tiff;depth=16'
  | 'image/tiff;depth=32f';

export type FormatJpegOrPng = 'JPEG_OR_PNG';

export const MimeTypes: Record<string, MimeType | FormatJpegOrPng> = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  JPEG_OR_PNG: 'JPEG_OR_PNG',
};

export type ImageProperties = {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  format: MimeType;
};

export const SH_SERVICE_HOSTNAMES_V1_OR_V2: string[] = ['https://eocloud.sentinel-hub.com/'];

export const SH_SERVICE_HOSTNAMES_V3: string[] = [
  'https://services.sentinel-hub.com/',
  'https://services-uswest2.sentinel-hub.com/',
  'https://creodias.sentinel-hub.com/',
  'https://sh.dataspace.copernicus.eu/',
];

// See https://services.sentinel-hub.com/api/v1/metadata/location/ for an up-to-date
// list of location ids and the corresponding URLs.
export enum LocationIdSHv3 {
  awsEuCentral1 = 'aws-eu-central-1',
  awsUsWest2 = 'aws-us-west-2',
  creo = 'creo',
  mundi = 'mundi',
  gcpUsCentral1 = 'gcp-us-central1',
  cdse = 'cdse',
}
export const SHV3_LOCATIONS_ROOT_URL: Record<LocationIdSHv3, string> = {
  [LocationIdSHv3.awsEuCentral1]: 'https://services.sentinel-hub.com/',
  [LocationIdSHv3.awsUsWest2]: 'https://services-uswest2.sentinel-hub.com/',
  [LocationIdSHv3.creo]: 'https://creodias.sentinel-hub.com/',
  [LocationIdSHv3.mundi]: 'https://shservices.mundiwebservices.com/',
  [LocationIdSHv3.gcpUsCentral1]: 'https://services-gcp-us-central1.sentinel-hub.com/',
  [LocationIdSHv3.cdse]: 'https://sh.dataspace.copernicus.eu/',
};

export const SH_SERVICE_ROOT_URL = {
  default: SHV3_LOCATIONS_ROOT_URL[LocationIdSHv3.awsEuCentral1],
  cdse: SHV3_LOCATIONS_ROOT_URL[LocationIdSHv3.cdse],
};

export type GetStatsParams = {
  fromTime: Date;
  toTime: Date;
  resolution: number;
  geometry?: Polygon;
  bins?: number;
  crs?: CRS;
  bbox?: BBox;
  output?: string;
};

export type FisPayload = {
  layer: string;
  crs: CRS_IDS;
  time: string;
  resolution: number | string;
  geometry?: string;
  type?: HistogramType;
  bins?: number;
  evalscript?: string;
  evalsource?: string;
};

export enum HistogramType {
  EQUALFREQUENCY = 'EQUALFREQUENCY',
  // EQUIDISTANT = 'EQUIDISTANT',
  // STREAMING = 'STREAMING',
}

export type DailyChannelStats = {
  date: Date;
  basicStats: {
    min: number;
    max: number;
    mean: number;
    stDev: number;
  };
  histogram?: {
    bins: {
      lowEdge: number;
      mean: number;
      count: number;
    }[];
  };
};

export type FisResponse = {
  [key: string]: DailyChannelStats[];
};

export type Stats = FisResponse | StatisticalApiResponse;

export const DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER = 50;

export type DataProductId = string;

export const SUPPORTED_DATA_PRODUCTS_PROCESSING: DataProductId[] = [
  'https://services.sentinel-hub.com/configuration/v1/datasets/S2L1C/dataproducts/643',
];

export type BYOCBand = {
  name: string;
  sampleType: string;
};

export type FindTilesAdditionalParameters = Record<string, any>;

//catalog search uses optional `limit` parameter that limits the number of items that are presented in the response document
//CATALOG_SEARCH_MAX_LIMIT represents maximum value for that parameter
export const CATALOG_SEARCH_MAX_LIMIT = 100;

export enum DEMInstanceType {
  MAPZEN = 'MAPZEN',
  COPERNICUS_30 = 'COPERNICUS_30',
  COPERNICUS_90 = 'COPERNICUS_90',
}

export enum DEMInstanceTypeOrthorectification {
  MAPZEN = 'MAPZEN',
  COPERNICUS = 'COPERNICUS',
  COPERNICUS_30 = 'COPERNICUS_30',
  COPERNICUS_90 = 'COPERNICUS_90',
}

export enum BYOCSubTypes {
  BATCH = 'BATCH',
  BYOC = 'BYOC',
  ZARR = 'ZARR',
}

export enum OgcServiceTypes {
  WMS = 'wms',
  WMTS = 'wmts',
}

export const PLANET_FALSE_COLOR_TEMPLATES = [
  { description: '', titleSuffix: 'NDWI', resourceUrlParams: { proc: 'ndwi' } },
  { description: '', titleSuffix: 'NDVI', resourceUrlParams: { proc: 'ndvi' } },
  { description: '', titleSuffix: 'MSAVI2', resourceUrlParams: { proc: 'msavi2' } },
  { description: '', titleSuffix: 'MTVI2', resourceUrlParams: { proc: 'mtvi2' } },
  { description: '', titleSuffix: 'VARI', resourceUrlParams: { proc: 'vari' } },
  { description: '', titleSuffix: 'TGI', resourceUrlParams: { proc: 'tgi' } },
  { description: '', titleSuffix: 'CIR', resourceUrlParams: { proc: 'cir' } },
];
