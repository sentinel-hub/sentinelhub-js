import { BBox } from 'src/bbox';
import { CRS_EPSG4326, CRS_EPSG3857, CRS_WGS84, SUPPORTED_CRS_OBJ } from 'src/crs';
import { setAuthToken, isAuthTokenSet, requestAuthToken } from 'src/auth';
import { ApiType, MimeTypes, OrbitDirection, PreviewMode } from 'src/layer/const';

import { LayersFactory } from 'src/layer/LayersFactory';
import {
  DATASET_BYOC,
  DATASET_AWSEU_S1GRD,
  DATASET_EOCLOUD_S1GRD,
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_S3SLSTR,
  DATASET_S3OLCI,
  DATASET_S5PL2,
  DATASET_AWS_L8L1C,
  DATASET_EOCLOUD_LANDSAT5,
  DATASET_EOCLOUD_LANDSAT7,
  DATASET_EOCLOUD_LANDSAT8,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  DATASET_MODIS,
  DATASET_AWS_DEM,
} from 'src/layer/dataset';
import { WmsLayer } from 'src/layer/WmsLayer';
import { S1GRDAWSEULayer } from 'src/layer/S1GRDAWSEULayer';
import { S1GRDEOCloudLayer } from 'src/layer/S1GRDEOCloudLayer';
import { S2L2ALayer } from 'src/layer/S2L2ALayer';
import { S2L1CLayer } from 'src/layer/S2L1CLayer';
import { S3SLSTRLayer, S3SLSTRView } from 'src/layer/S3SLSTRLayer';
import { S3OLCILayer } from 'src/layer/S3OLCILayer';
import { S5PL2Layer } from 'src/layer/S5PL2Layer';
import { EnvisatMerisEOCloudLayer } from 'src/layer/EnvisatMerisEOCloudLayer';
import { MODISLayer } from 'src/layer/MODISLayer';
import { DEMLayer } from 'src/layer/DEMLayer';
import { Landsat5EOCloudLayer } from 'src/layer/Landsat5EOCloudLayer';
import { Landsat7EOCloudLayer } from 'src/layer/Landsat7EOCloudLayer';
import { Landsat8EOCloudLayer } from 'src/layer/Landsat8EOCloudLayer';
import { Landsat8AWSLayer } from 'src/layer/Landsat8AWSLayer';
import { BYOCLayer } from 'src/layer/BYOCLayer';
import { ProcessingDataFusionLayer } from 'src/layer/ProcessingDataFusionLayer';

import { legacyGetMapFromUrl, legacyGetMapWmsUrlFromParams, legacyGetMapFromParams } from 'src/legacyCompat';
import { AcquisitionMode, Polarization, Resolution } from 'src/layer/S1GRDAWSEULayer';
import { registerAxiosCacheRetryInterceptors } from 'src/utils/axiosInterceptors';

registerAxiosCacheRetryInterceptors();

export {
  LayersFactory,
  DATASET_BYOC,
  DATASET_AWSEU_S1GRD,
  DATASET_EOCLOUD_S1GRD,
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_S3SLSTR,
  DATASET_S3OLCI,
  DATASET_S5PL2,
  DATASET_AWS_L8L1C,
  DATASET_EOCLOUD_LANDSAT5,
  DATASET_EOCLOUD_LANDSAT7,
  DATASET_EOCLOUD_LANDSAT8,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  // layers:
  WmsLayer,
  S1GRDAWSEULayer,
  S1GRDEOCloudLayer,
  S2L2ALayer,
  S2L1CLayer,
  S3SLSTRLayer,
  S3OLCILayer,
  S5PL2Layer,
  EnvisatMerisEOCloudLayer,
  MODISLayer,
  DEMLayer,
  Landsat5EOCloudLayer,
  Landsat7EOCloudLayer,
  Landsat8EOCloudLayer,
  Landsat8AWSLayer,
  BYOCLayer,
  ProcessingDataFusionLayer,
  // auth:
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  // other:
  ApiType,
  SUPPORTED_CRS_OBJ,
  CRS_EPSG4326,
  CRS_EPSG3857,
  CRS_WGS84,
  MimeTypes,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
  PreviewMode,
  S3SLSTRView,
  BBox,
  // legacy:
  legacyGetMapFromUrl,
  legacyGetMapWmsUrlFromParams,
  legacyGetMapFromParams,
};
