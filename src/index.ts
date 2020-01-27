import { BBox } from 'src/bbox';
import { CRS_EPSG4326, CRS_EPSG3857, CRS_WGS84, SUPPORTED_CRS_OBJ } from 'src/crs';
import { setAuthToken, isAuthTokenSet } from 'src/auth';
import { ApiType, MimeTypes } from 'src/layer/const';

import { LayersFactory } from 'src/layer/LayersFactory';
import {
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_AWS_L8L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWS_S1GRD_IW,
} from 'src/layer/dataset';
import { WmsLayer } from 'src/layer/WmsLayer';
import { S1GRDIWAWSLayer } from 'src/layer/S1GRDIWAWSLayer';
import { S2L2ALayer } from 'src/layer/S2L2ALayer';
import { S2L1CLayer } from 'src/layer/S2L1CLayer';
import { MODISLayer } from 'src/layer/MODISLayer';
import { DEMLayer } from 'src/layer/DEMLayer';
import { Landsat8AWSLayer } from 'src/layer/Landsat8AWSLayer';

import { legacyGetMapFromUrl, legacyGetMapWmsUrlFromParams, legacyGetMapFromParams } from 'src/legacyCompat';
import { Polarization, OrbitDirection } from 'src/layer/S1GRDIWAWSLayer';

export {
  LayersFactory,
  DATASET_S2L2A,
  DATASET_S2L1C,
  DATASET_AWS_L8L1C,
  DATASET_MODIS,
  DATASET_AWS_DEM,
  DATASET_AWS_S1GRD_IW,
  // layers:
  WmsLayer,
  S1GRDIWAWSLayer,
  S2L2ALayer,
  S2L1CLayer,
  MODISLayer,
  DEMLayer,
  Landsat8AWSLayer,
  // auth:
  setAuthToken,
  isAuthTokenSet,
  // other:
  ApiType,
  SUPPORTED_CRS_OBJ,
  CRS_EPSG4326,
  CRS_EPSG3857,
  CRS_WGS84,
  MimeTypes,
  Polarization,
  OrbitDirection,
  BBox,
  // legacy:
  legacyGetMapFromUrl,
  legacyGetMapWmsUrlFromParams,
  legacyGetMapFromParams,
};
