import { Polygon, MultiPolygon } from '@turf/helpers';

import { BBox } from 'src/bbox';
import { CRS_IDS } from 'src/crs';

/**
 * Specifies the content that should be fetched (area, time or time interval, modifiers, output format,...).
 */
export type GetMapParams = {
  bbox: BBox;
  /** Start of the time interval for which the images are fetched. If null, only `toTime` parameter will be used. */
  fromTime: Date | null;
  /** End of the time interval for which the images are fetched. If `fromTime` is null, only this parameter will be used to set time. */
  toTime: Date;
  format: MimeType;
  resx?: string; // either resx + resy or width + height must be specified
  resy?: string;
  width?: number;
  height?: number;
  // optional additional parameters:
  preview?: PreviewMode;
  geometry?: Polygon | MultiPolygon;
  quality?: number;
  gain?: number;
  gamma?: number;
  nicename?: string;
  showlogo?: boolean;
  bgcolor?: string;
  transparent?: boolean;
  temporal?: boolean;
  upsampling?: Interpolator;
  downsampling?: Interpolator;
  // and any that we don't know about, but might have been passed to us through legacy methods:
  unknown?: {
    [key: string]: string;
  };
};

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
}

export enum LinkType {
  EOCLOUD = 'eocloud',
  AWS = 'aws',
  PREVIEW = 'preview',
  CREODIAS = 'creodias',
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

export const MimeTypes: Record<string, MimeType> = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
};

export const SH_SERVICE_HOSTNAMES_V1_OR_V2: string[] = ['https://eocloud.sentinel-hub.com/'];

export const SH_SERVICE_HOSTNAMES_V3: string[] = [
  'https://services.sentinel-hub.com/',
  'https://services-uswest2.sentinel-hub.com/',
  'https://creodias.sentinel-hub.com/',
];

// See https://services.sentinel-hub.com/api/v1/metadata/location/ for an up-to-date
// list of location ids and the corresponding URLs.
export enum LocationIdSHv3 {
  awsEuCentral1 = 'aws-eu-central-1',
  awsUsWest2 = 'aws-us-west-2',
  creo = 'creo',
  mundi = 'mundi',
}
export const SHV3_LOCATIONS_ROOT_URL: Record<LocationIdSHv3, string> = {
  [LocationIdSHv3.awsEuCentral1]: 'https://services.sentinel-hub.com/',
  [LocationIdSHv3.awsUsWest2]: 'https://services-uswest2.sentinel-hub.com/',
  [LocationIdSHv3.creo]: 'https://creodias.sentinel-hub.com/',
  [LocationIdSHv3.mundi]: 'https://shservices.mundiwebservices.com/',
};

export type GetStatsParams = {
  fromTime: Date;
  toTime: Date;
  resolution: number;
  geometry: Polygon;
  bins?: number;
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
  histogram: {
    bins: [
      {
        lowEdge: number;
        mean: number;
        count: number;
      },
    ];
  };
};

export type Stats = {
  [key: string]: DailyChannelStats[];
};

export const DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER = 50;
