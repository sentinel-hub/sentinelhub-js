import { Polygon, MultiPolygon } from '@turf/helpers';

import { BBox } from 'src/bbox';

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
  preview?: number;
  geometry?: string;
  quality?: number;
  gain?: number;
  gamma?: number;
  nicename?: string;
  showlogo?: boolean;
  bgcolor?: string;
  transparent?: boolean | number;
  temporal?: boolean;
  upsampling?: Interpolator;
  downsampling?: Interpolator;
  // and any that we don't know about, but might have been passed to us through legacy methods:
  unknown?: {
    [key: string]: string;
  };
};

export type Interpolator = 'BILINEAR' | 'BICUBIC' | 'LANCZOS' | 'BOX' | 'NEAREST';

export enum PreviewMode {
  DETAIL = 'DETAIL',
  PREVIEW = 'PREVIEW',
  EXTENDED_PREVIEW = 'EXTENDED_PREVIEW',
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

export type Tile = {
  geometry: Polygon | MultiPolygon;
  sensingTime: Date;
  meta: Record<string, any>;
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
