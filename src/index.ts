import { BBox } from 'src/bbox';
import { CRS_EPSG4326, CRS_EPSG3857, CRS_WGS84, SUPPORTED_CRS_OBJ } from 'src/crs';
import { setAuthToken, isAuthTokenSet, requestAuthToken } from 'src/auth';
import { ApiType, MimeTypes } from 'src/layer/const';

import { LayersFactory } from 'src/layer/LayersFactory';
import {
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_AWS_L8L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSEU_S1GRD,
} from 'src/layer/dataset';
import { WmsLayer } from 'src/layer/WmsLayer';
import { S1GRDAWSEULayer } from 'src/layer/S1GRDAWSEULayer';
import { S2L2ALayer } from 'src/layer/S2L2ALayer';
import { S2L1CLayer } from 'src/layer/S2L1CLayer';
import { S3SLSTRLayer } from 'src/layer/S3SLSTRLayer';
import { S3OLCILayer } from 'src/layer/S3OLCILayer';
import { S5PL2Layer } from 'src/layer/S5PL2Layer';
import { MODISLayer } from 'src/layer/MODISLayer';
import { DEMLayer } from 'src/layer/DEMLayer';
import { Landsat8AWSLayer } from 'src/layer/Landsat8AWSLayer';

import { legacyGetMapFromUrl, legacyGetMapWmsUrlFromParams, legacyGetMapFromParams } from 'src/legacyCompat';
import { AcquisitionMode, Polarization, Resolution, OrbitDirection } from 'src/layer/S1GRDAWSEULayer';
import { registerAxiosCacheRetryInterceptors } from './utils/axiosInterceptors';

registerAxiosCacheRetryInterceptors();

export {
  LayersFactory,
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_AWS_L8L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSEU_S1GRD,
  // layers:
  WmsLayer,
  S1GRDAWSEULayer,
  S2L2ALayer,
  S2L1CLayer,
  S3SLSTRLayer,
  S3OLCILayer,
  S5PL2Layer,
  MODISLayer,
  DEMLayer,
  Landsat8AWSLayer,
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
  BBox,
  // legacy:
  legacyGetMapFromUrl,
  legacyGetMapWmsUrlFromParams,
  legacyGetMapFromParams,
};
