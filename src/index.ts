import { BBox } from './bbox';
import { CRS_EPSG4326, CRS_EPSG3857, CRS_WGS84, SUPPORTED_CRS_OBJ } from './crs';
import { setAuthToken, isAuthTokenSet, requestAuthToken } from './auth';
import {
  ApiType,
  MimeTypes,
  OrbitDirection,
  PreviewMode,
  MosaickingOrder,
  Interpolator,
  BackscatterCoeff,
  DEMInstanceType,
  DEMInstanceTypeOrthorectification,
} from './layer/const';
import { setDebugEnabled } from './utils/debug';

import { LayersFactory } from './layer/LayersFactory';
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
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  DATASET_EOCLOUD_LANDSAT5,
  DATASET_EOCLOUD_LANDSAT7,
  DATASET_EOCLOUD_LANDSAT8,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSUS_DEM,
} from './layer/dataset';
import { WmsLayer } from './layer/WmsLayer';
import { S1GRDAWSEULayer } from './layer/S1GRDAWSEULayer';
import { S1GRDEOCloudLayer } from './layer/S1GRDEOCloudLayer';
import { S2L2ALayer } from './layer/S2L2ALayer';
import { S2L1CLayer } from './layer/S2L1CLayer';
import { S3SLSTRLayer, S3SLSTRView } from './layer/S3SLSTRLayer';
import { S3OLCILayer } from './layer/S3OLCILayer';
import { S5PL2Layer } from './layer/S5PL2Layer';
import { EnvisatMerisEOCloudLayer } from './layer/EnvisatMerisEOCloudLayer';
import { MODISLayer } from './layer/MODISLayer';
import { DEMAWSUSLayer } from './layer/DEMAWSUSLayer';
import { DEMLayer } from './layer/DEMLayer';
import { Landsat5EOCloudLayer } from './layer/Landsat5EOCloudLayer';
import { Landsat7EOCloudLayer } from './layer/Landsat7EOCloudLayer';
import { Landsat8EOCloudLayer } from './layer/Landsat8EOCloudLayer';
import { Landsat8AWSLayer } from './layer/Landsat8AWSLayer';
import { Landsat8AWSLOTL1Layer } from './layer/Landsat8AWSLOTL1Layer';
import { Landsat8AWSLOTL2Layer } from './layer/Landsat8AWSLOTL2Layer';

import { BYOCLayer } from './layer/BYOCLayer';
import { ProcessingDataFusionLayer } from './layer/ProcessingDataFusionLayer';

import {
  legacyGetMapFromUrl,
  legacyGetMapWmsUrlFromParams,
  legacyGetMapFromParams,
  parseLegacyWmsGetMapParams,
} from './legacyCompat';

import { AcquisitionMode, Polarization, Resolution } from './layer/S1GRDAWSEULayer';
import { LocationIdSHv3, GetMapParams, LinkType, OverrideGetMapParams } from './layer/const';
import { registerInitialAxiosInterceptors } from './utils/axiosInterceptors';
import { registerHostnameReplacing } from './utils/replaceHostnames';
import { CancelToken, isCancelled, RequestConfiguration } from './utils/cancelRequests';
import { setDefaultRequestsConfig } from './utils/defaultReqsConfig';
import { CacheTarget, invalidateCaches } from './utils/Cache';
import { wmsGetMapUrl as _wmsGetMapUrl } from './layer/wms';
import { drawBlobOnCanvas, canvasToBlob } from './utils/canvas';

import { Effects, ColorRange } from './mapDataManipulation/const';

registerInitialAxiosInterceptors();

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
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  DATASET_EOCLOUD_LANDSAT5,
  DATASET_EOCLOUD_LANDSAT7,
  DATASET_EOCLOUD_LANDSAT8,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWSUS_DEM,
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
  DEMAWSUSLayer,
  DEMLayer,
  Landsat5EOCloudLayer,
  Landsat7EOCloudLayer,
  Landsat8EOCloudLayer,
  Landsat8AWSLayer,
  Landsat8AWSLOTL1Layer,
  Landsat8AWSLOTL2Layer,
  BYOCLayer,
  ProcessingDataFusionLayer,
  // auth:
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  // other:
  GetMapParams,
  OverrideGetMapParams,
  LinkType,
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
  MosaickingOrder,
  Interpolator,
  BackscatterCoeff,
  DEMInstanceType,
  DEMInstanceTypeOrthorectification,
  S3SLSTRView,
  BBox,
  LocationIdSHv3,
  setDebugEnabled,
  CancelToken,
  isCancelled,
  CacheTarget,
  invalidateCaches,
  registerHostnameReplacing,
  RequestConfiguration,
  setDefaultRequestsConfig,
  drawBlobOnCanvas,
  canvasToBlob,
  // legacy:
  legacyGetMapFromUrl,
  legacyGetMapWmsUrlFromParams,
  legacyGetMapFromParams,
  parseLegacyWmsGetMapParams,
  // discouraged - temporary solution which will likely break in the future:
  _wmsGetMapUrl,
  // map data manipulation
  Effects,
  ColorRange,
};
