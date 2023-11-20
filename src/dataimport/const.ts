import { Polygon, MultiPolygon } from '@turf/helpers';
import { CRS } from '../crs';
import { BBox } from '../bbox';

export enum TPDICollections {
  AIRBUS_PLEIADES = 'AIRBUS_PLEIADES',
  AIRBUS_SPOT = 'AIRBUS_SPOT',
  PLANET_SCOPE = 'PLANET_SCOPE',
  MAXAR_WORLDVIEW = 'MAXAR_WORLDVIEW',
  PLANET_SKYSAT = 'PLANET_SKYSAT',
  PLANETARY_VARIABLES = 'PLANETARY_VARIABLES',
}

export enum TPDProvider {
  AIRBUS = 'AIRBUS',
  PLANET = 'PLANET',
  PLANETARY_VARIABLES = 'PLANETARY_VARIABLES',
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

export enum PlanetPVType {
  BiomassProxy = 'biomass_proxy',
  LandSurfaceTemperature = 'land_surface_temperature',
  SoilWaterContent = 'soil_water_content',
  VegetationOpticalDepth = 'vegetation_optical_depth',
  ForestCarbonDiligence30m = 'forest_carbon_diligence_30m',
}

export enum PlanetPVId {
  BIOMASS_PROXY_V3_0_10 = 'BIOMASS-PROXY_V3.0_10',
  LST_AMSR2_V1_0_100 = 'LST-AMSR2_V1.0_100',
  LST_AMSRE_V1_0_1000 = 'LST-AMSRE_V1.0_1000',
  LST_AMSR2_V1_0_1000 = 'LST-AMSR2_V1.0_1000',
  SWC_AMSR2_C_V1_0_100 = 'SWC-AMSR2-C_V1.0_100',
  SWC_AMSR2_X_V1_0_100 = 'SWC-AMSR2-X_V1.0_100',
  SWC_SMAP_L_V1_0_100 = 'SWC-SMAP-L_V1.0_100',
  SWC_AMSRE_C_V4_0_1000 = 'SWC-AMSRE-C_V4.0_1000',
  SWC_AMSRE_X_V4_0_1000 = 'SWC-AMSRE-X_V4.0_1000',
  SWC_AMSR2_C_V4_0_1000 = 'SWC-AMSR2-C_V4.0_1000',
  SWC_AMSR2_X_V4_0_1000 = 'SWC-AMSR2-X_V4.0_1000',
  SWC_SMAP_L_V4_0_1000 = 'SWC-SMAP-L_V4.0_1000',
  VOD_AMSRE_C_V4_0_1000 = 'VOD-AMSRE-C_V4.0_1000',
  VOD_AMSRE_X_V4_0_1000 = 'VOD-AMSRE-X_V4.0_1000',
  VOD_AMSR2_C_V4_0_1000 = 'VOD-AMSR2-C_V4.0_1000',
  VOD_AMSR2_X_V4_0_1000 = 'VOD-AMSR2-X_V4.0_1000',
  CANOPY_HEIGHT_V1_0_0_30 = 'CANOPY_HEIGHT_v1.0.0_30',
  CANOPY_COVER_V1_0_0_30 = 'CANOPY_COVER_v1.0.0_30',
  ABOVEGROUND_CARBON_DENSITY_V1_0_0_30 = 'ABOVEGROUND_CARBON_DENSITY_v1.0.0_30',
  DAY_OF_YEAR_V1_0_0_30 = 'DAY_OF_YEAR_v1.0.0_30',
}

export const PlanetSupportedPVIds = {
  [PlanetPVType.BiomassProxy]: [PlanetPVId.BIOMASS_PROXY_V3_0_10],
  [PlanetPVType.LandSurfaceTemperature]: [
    PlanetPVId.LST_AMSR2_V1_0_100,
    PlanetPVId.LST_AMSRE_V1_0_1000,
    PlanetPVId.LST_AMSR2_V1_0_1000,
  ],
  [PlanetPVType.SoilWaterContent]: [
    PlanetPVId.SWC_AMSR2_C_V1_0_100,
    PlanetPVId.SWC_AMSR2_X_V1_0_100,
    PlanetPVId.SWC_SMAP_L_V1_0_100,
    PlanetPVId.SWC_AMSRE_C_V4_0_1000,
    PlanetPVId.SWC_AMSRE_X_V4_0_1000,
    PlanetPVId.SWC_AMSR2_C_V4_0_1000,
    PlanetPVId.SWC_AMSR2_X_V4_0_1000,
    PlanetPVId.SWC_SMAP_L_V4_0_1000,
  ],
  [PlanetPVType.VegetationOpticalDepth]: [
    PlanetPVId.VOD_AMSRE_C_V4_0_1000,
    PlanetPVId.VOD_AMSRE_X_V4_0_1000,
    PlanetPVId.VOD_AMSR2_C_V4_0_1000,
    PlanetPVId.VOD_AMSR2_X_V4_0_1000,
  ],
  [PlanetPVType.ForestCarbonDiligence30m]: [
    PlanetPVId.CANOPY_HEIGHT_V1_0_0_30,
    PlanetPVId.CANOPY_COVER_V1_0_0_30,
    PlanetPVId.ABOVEGROUND_CARBON_DENSITY_V1_0_0_30,
    PlanetPVId.DAY_OF_YEAR_V1_0_0_30,
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
  pvType?: PlanetPVType;
  pvId?: PlanetPVId;
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
