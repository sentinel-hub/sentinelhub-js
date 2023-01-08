import { Polygon, MultiPolygon } from '@turf/helpers';
import { BBox } from '../bbox';
import { CRS, CRS_IDS } from '../crs';
import { Effects } from '../mapDataManipulation/const';
import { StatisticalApiResponse } from '../statistics/const';
/**
 * Specifies the content that should be fetched (area, time or time interval, modifiers, output format,...).
 */
export declare type GetMapParams = {
    bbox: BBox;
    /** Start of the time interval for which the images are fetched. If null, only `toTime` parameter will be used. */
    fromTime: Date | null;
    /** End of the time interval for which the images are fetched. If `fromTime` is null, only this parameter will be used to set time. */
    toTime: Date;
    format: MimeType | FormatJpegOrPng;
    resx?: string;
    resy?: string;
    width?: number;
    height?: number;
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
    outputResponseId?: string;
    tileCoord?: {
        x: number;
        y: number;
        z: number;
    };
    unknown?: {
        [key: string]: string;
    };
};
export declare type OverrideGetMapParams = Partial<GetMapParams>;
export declare enum Interpolator {
    BILINEAR = "BILINEAR",
    BICUBIC = "BICUBIC",
    LANCZOS = "LANCZOS",
    BOX = "BOX",
    NEAREST = "NEAREST"
}
export declare enum PreviewMode {
    DETAIL = 0,
    PREVIEW = 1,
    EXTENDED_PREVIEW = 2
}
export declare enum MosaickingOrder {
    MOST_RECENT = "mostRecent",
    LEAST_RECENT = "leastRecent",
    LEAST_CC = "leastCC"
}
export declare enum ApiType {
    WMS = "wms",
    WMTS = "wmts",
    PROCESSING = "processing"
}
export declare enum OrbitDirection {
    ASCENDING = "ASCENDING",
    DESCENDING = "DESCENDING"
}
export declare enum BackscatterCoeff {
    BETA0 = "BETA0",
    GAMMA0_ELLIPSOID = "GAMMA0_ELLIPSOID",
    SIGMA0_ELLIPSOID = "SIGMA0_ELLIPSOID",
    GAMMA0_TERRAIN = "GAMMA0_TERRAIN"
}
export declare enum LinkType {
    EOCLOUD = "eocloud",
    AWS = "aws",
    PREVIEW = "preview",
    CREODIAS = "creodias",
    SCIHUB = "scihub"
}
export declare type Link = {
    target: string;
    type: LinkType;
};
export declare type Tile = {
    geometry: Polygon | MultiPolygon;
    sensingTime: Date;
    meta: Record<string, any>;
    links?: Link[];
};
export declare type PaginatedTiles = {
    tiles: Tile[];
    hasMore: boolean;
};
export declare type FlyoverInterval = {
    fromTime: Date;
    toTime: Date;
    coveragePercent: number;
    meta: Record<string, any>;
};
export declare type MimeType = 'application/json' | 'text/xml' | 'image/png' | 'image/jpeg' | 'image/tiff' | 'image/tiff;depth=8' | 'image/tiff;depth=16' | 'image/tiff;depth=32f';
export declare type FormatJpegOrPng = 'JPEG_OR_PNG';
export declare const MimeTypes: Record<string, MimeType | FormatJpegOrPng>;
export declare type ImageProperties = {
    rgba: Uint8ClampedArray;
    width: number;
    height: number;
    format: MimeType;
};
export declare const SH_SERVICE_HOSTNAMES_V1_OR_V2: string[];
export declare const SH_SERVICE_HOSTNAMES_V3: string[];
export declare enum LocationIdSHv3 {
    awsEuCentral1 = "aws-eu-central-1",
    awsUsWest2 = "aws-us-west-2",
    creo = "creo",
    mundi = "mundi",
    gcpUsCentral1 = "gcp-us-central1"
}
export declare const SHV3_LOCATIONS_ROOT_URL: Record<LocationIdSHv3, string>;
export declare type GetStatsParams = {
    fromTime: Date;
    toTime: Date;
    resolution: number;
    geometry?: Polygon;
    bins?: number;
    crs?: CRS;
    bbox?: BBox;
    output?: string;
};
export declare type FisPayload = {
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
export declare enum HistogramType {
    EQUALFREQUENCY = "EQUALFREQUENCY"
}
export declare type DailyChannelStats = {
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
export declare type FisResponse = {
    [key: string]: DailyChannelStats[];
};
export declare type Stats = FisResponse | StatisticalApiResponse;
export declare const DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER = 50;
export declare type DataProductId = string;
export declare const SUPPORTED_DATA_PRODUCTS_PROCESSING: DataProductId[];
export declare type BYOCBand = {
    name: string;
    sampleType: string;
};
export declare type FindTilesAdditionalParameters = Record<string, any>;
export declare const CATALOG_SEARCH_MAX_LIMIT = 100;
export declare enum DEMInstanceType {
    MAPZEN = "MAPZEN",
    COPERNICUS_30 = "COPERNICUS_30",
    COPERNICUS_90 = "COPERNICUS_90"
}
export declare enum DEMInstanceTypeOrthorectification {
    MAPZEN = "MAPZEN",
    COPERNICUS = "COPERNICUS",
    COPERNICUS_30 = "COPERNICUS_30",
    COPERNICUS_90 = "COPERNICUS_90"
}
export declare enum BYOCSubTypes {
    BATCH = "BATCH",
    BYOC = "BYOC",
    ZARR = "ZARR"
}
export declare enum OgcServiceTypes {
    WMS = "wms",
    WMTS = "wmts"
}
export declare const PLANET_FALSE_COLOR_TEMPLATES: {
    description: string;
    titleSuffix: string;
    resourceUrlParams: {
        proc: string;
    };
}[];
