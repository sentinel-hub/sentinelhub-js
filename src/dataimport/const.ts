import { Polygon, MultiPolygon } from '@turf/helpers';
import { CRS } from '../crs';
import { BBox } from '../bbox';

export enum TPDICollections {
  AIRBUS_PLEIADES = 'AIRBUS_PLEIADES',
  AIRBUS_SPOT = 'AIRBUS_SPOT',
  PLANET_SCOPE = 'PLANET_SCOPE',
  MAXAR_WORLDVIEW = 'MAXAR_WORLDVIEW',
  PLANET_SKYSAT = 'PLANET_SKYSAT',
}

export enum TPDProvider {
  AIRBUS = 'AIRBUS',
  PLANET = 'PLANET',
  MAXAR = 'MAXAR',
}

export enum AirbusProcessingLevel {
  SENSOR = 'SENSOR',
  ALBUM = 'ALBUM',
}

export enum AirbusConstellation {
  PHR = 'PHR',
  SPOT = 'SPOT',
}

export enum MaxarSensor {
  WV01 = 'WV01',
  WV02 = 'WV02',
  WV03 = 'WV03',
  WV04 = 'WV04',
  GE01 = 'GE01',
}

export enum PlanetProductBundle {
  ANALYTIC = 'analytic',
  ANALYTIC_UDM2 = 'analytic_udm2',
  ANALYTIC_SR = 'analytic_sr',
  ANALYTIC_SR_UDM2 = 'analytic_sr_udm2',
  ANALYTIC_8B_UDM2 = 'analytic_8b_udm2',
  ANALYTIC_8B_SR_UDM2 = 'analytic_8b_sr_udm2',
  PANCHROMATIC = 'panchromatic',
}

export enum PlanetItemType {
  PSScene = 'PSScene',
  PSScene4Band = 'PSScene4Band',
  SkySatCollect = 'SkySatCollect',
}

export const PlanetSupportedProductBundles = {
  [PlanetItemType.PSScene4Band]: [
    PlanetProductBundle.ANALYTIC,
    PlanetProductBundle.ANALYTIC_UDM2,
    PlanetProductBundle.ANALYTIC_SR,
    PlanetProductBundle.ANALYTIC_SR_UDM2,
  ],
  [PlanetItemType.PSScene]: [
    PlanetProductBundle.ANALYTIC_UDM2,
    PlanetProductBundle.ANALYTIC_8B_UDM2,
    PlanetProductBundle.ANALYTIC_SR_UDM2,
    PlanetProductBundle.ANALYTIC_8B_SR_UDM2,
  ],
  [PlanetItemType.SkySatCollect]: [
    PlanetProductBundle.ANALYTIC_UDM2,
    PlanetProductBundle.ANALYTIC_SR_UDM2,
    PlanetProductBundle.PANCHROMATIC,
  ],
};

export const MaxarProductBands = '4BB';

export type TPDISearchParams = {
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

export type TPDITransactionParams = {
  harmonizeTo?: PlanetScopeHarmonization;
  planetApiKey?: string;
  productKernel?: ResamplingKernel;
};

export type TPDITransactionCompatibleCollection = {
  id: string;
  name: string;
};

type LinksType = {
  currentToken: string;
  nextToken: string;
  previousToken: string;
  '@id': string;
  next: string;
  previous: string;
};

export type TPDSearchResult = {
  features: any[];
  links?: LinksType;
  totalResults?: number;
};

export type Quota = {
  collectionId: TPDICollections;
  quotaSqkm: number | null;
  quotaUsed: number | null;
};

export enum TPDITransactionStatus {
  CREATED = 'CREATED',
  CANCELLED = 'CANCELLED',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export type TPDITransaction = {
  id: string;
  name: string;
  userId: string;
  collectionId: string;
  status: TPDITransactionStatus;
  sqkm: number;
  input: Record<string, any>;
};

export type TPDITransactionSearchParams = {
  status?: TPDITransactionStatus;
  collectionId?: string;
  search?: string;
};

export type TPDITransactionSearchResult = {
  data: TPDITransaction[];
  links?: LinksType;
};

export enum PlanetScopeHarmonization {
  PS2 = 'PS2',
  NONE = 'NONE',
  SENTINEL2 = 'Sentinel-2',
}

export enum ResamplingKernel {
  CC = 'CC',
  NN = 'NN',
  MTF = 'MTF',
}

export enum HLSConstellation {
  LANDSAT = 'LANDSAT',
  SENTINEL = 'SENTINEL',
}
