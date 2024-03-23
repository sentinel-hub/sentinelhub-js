import { Polygon, MultiPolygon } from '@turf/helpers';
import { CRS } from '../crs';
import { BBox } from '../bbox';
export declare const TPDI_SERVICE_URL = "https://services.sentinel-hub.com/api/v1/dataimport";
export declare enum TPDICollections {
    AIRBUS_PLEIADES = "AIRBUS_PLEIADES",
    AIRBUS_SPOT = "AIRBUS_SPOT",
    PLANET_SCOPE = "PLANET_SCOPE",
    MAXAR_WORLDVIEW = "MAXAR_WORLDVIEW",
    PLANET_SKYSAT = "PLANET_SKYSAT"
}
export declare enum TPDProvider {
    AIRBUS = "AIRBUS",
    PLANET = "PLANET",
    MAXAR = "MAXAR"
}
export declare enum AirbusProcessingLevel {
    SENSOR = "SENSOR",
    ALBUM = "ALBUM"
}
export declare enum AirbusConstellation {
    PHR = "PHR",
    SPOT = "SPOT"
}
export declare enum MaxarSensor {
    WV01 = "WV01",
    WV02 = "WV02",
    WV03 = "WV03",
    WV04 = "WV04",
    GE01 = "GE01"
}
export declare enum PlanetProductBundle {
    ANALYTIC = "analytic",
    ANALYTIC_UDM2 = "analytic_udm2",
    ANALYTIC_SR = "analytic_sr",
    ANALYTIC_SR_UDM2 = "analytic_sr_udm2",
    ANALYTIC_8B_UDM2 = "analytic_8b_udm2",
    ANALYTIC_8B_SR_UDM2 = "analytic_8b_sr_udm2",
    PANCHROMATIC = "panchromatic"
}
export declare enum PlanetItemType {
    PSScene = "PSScene",
    PSScene4Band = "PSScene4Band",
    SkySatCollect = "SkySatCollect"
}
export declare const PlanetSupportedProductBundles: {
    PSScene4Band: PlanetProductBundle[];
    PSScene: PlanetProductBundle[];
    SkySatCollect: PlanetProductBundle[];
};
export declare const MaxarProductBands = "4BB";
export declare type TPDISearchParams = {
    bbox?: BBox;
    geometry?: Polygon | MultiPolygon;
    crs?: CRS;
    fromTime: Date;
    toTime: Date;
    expiredFromTime?: Date;
    expiredToTime?: Date;
    maxCloudCoverage?: number;
    processingLevel?: AirbusProcessingLevel;
    maxSnowCoverage?: number;
    maxIncidenceAngle?: number;
    minOffNadir?: number;
    maxOffNadir?: number;
    minSunElevation?: number;
    maxSunElevation?: number;
    constellation?: AirbusConstellation;
    nativeFilter?: any;
    sensor?: MaxarSensor;
    itemType?: PlanetItemType;
    productBundle?: PlanetProductBundle;
};
export declare type TPDITransactionParams = {
    harmonizeTo?: PlanetScopeHarmonization;
    planetApiKey?: string;
    productKernel?: ResamplingKernel;
};
export declare type TPDITransactionCompatibleCollection = {
    id: string;
    name: string;
};
declare type LinksType = {
    currentToken: string;
    nextToken: string;
    previousToken: string;
    '@id': string;
    next: string;
    previous: string;
};
export declare type TPDSearchResult = {
    features: any[];
    links?: LinksType;
    totalResults?: number;
};
export declare type Quota = {
    collectionId: TPDICollections;
    quotaSqkm: number | null;
    quotaUsed: number | null;
};
export declare enum TPDITransactionStatus {
    CREATED = "CREATED",
    CANCELLED = "CANCELLED",
    RUNNING = "RUNNING",
    DONE = "DONE",
    PARTIAL = "PARTIAL",
    FAILED = "FAILED",
    COMPLETED = "COMPLETED"
}
export declare type TPDITransaction = {
    id: string;
    name: string;
    userId: string;
    collectionId: string;
    status: TPDITransactionStatus;
    sqkm: number;
    input: Record<string, any>;
};
export declare type TPDITransactionSearchParams = {
    status?: TPDITransactionStatus;
    collectionId?: string;
    search?: string;
};
export declare type TPDITransactionSearchResult = {
    data: TPDITransaction[];
    links?: LinksType;
};
export declare enum PlanetScopeHarmonization {
    PS2 = "PS2",
    NONE = "NONE",
    SENTINEL2 = "Sentinel-2"
}
export declare enum ResamplingKernel {
    CC = "CC",
    NN = "NN",
    MTF = "MTF"
}
export declare enum HLSConstellation {
    LANDSAT = "LANDSAT",
    SENTINEL = "SENTINEL"
}
export {};
