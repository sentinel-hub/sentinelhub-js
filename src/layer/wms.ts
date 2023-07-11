import { stringify } from 'query-string';
import moment from 'moment';
import WKT from 'terraformer-wkt-parser';

import { CRS_EPSG4326, CRS_IDS } from '../crs';
import { GetMapParams, MimeTypes, MimeType, MosaickingOrder } from './const';

export enum ServiceType {
  WMS = 'WMS',
  WCS = 'WCS',
  WFS = 'WFS',
}

type OgcGetMapOptions = {
  version: string;
  service: ServiceType;
  request: string;
  // crs: CRS_IDS; // if using WMS >= 1.3.0
  srs: CRS_IDS; // if using WMS <= 1.1.1
  format: MimeType;
  transparent: boolean | number;
  layers: string;
  bbox: string;
  time: string;
  width?: number;
  height?: number;
  resx?: number | string;
  resy?: number | string;
  showlogo?: boolean;
  bgcolor?: string;
  maxcc?: number;
  evalscript?: string;
  evalscripturl?: string;
  preview?: number;
  priority?: MosaickingOrder;
  geometry?: string;
  quality?: number;
  evalsource?: string;
  nicename?: string;
  temporal?: boolean;
};

const OGC_SERVICES_IMPLEMENTED_VERSIONS: { [key: string]: string } = {
  // to simplify, we always choose the versions which will use longitude/latitude order
  // https://www.sentinel-hub.com/faq/why-result-different-when-i-am-using-wms-or-wcs-when-coordinate-system-epsg4326
  WMS: '1.1.1',
  WCS: '1.0.0',
  WFS: '1.0.0',
};

export function wmsGetMapUrl(
  baseUrl: string,
  layers: string,
  params: GetMapParams,
  evalscript: string | null = null,
  evalscriptUrl: string | null = null,
  evalsource: string | null = null,
  additionalParameters: Record<string, any> = {},
): string {
  const queryParams: OgcGetMapOptions = {
    version: OGC_SERVICES_IMPLEMENTED_VERSIONS[ServiceType.WMS],
    service: ServiceType.WMS,
    request: 'GetMap',
    format: MimeTypes.JPEG as MimeType,
    srs: CRS_EPSG4326.authId,
    layers: undefined,
    bbox: undefined,
    time: undefined,
    width: undefined,
    height: undefined,
    showlogo: undefined,
    transparent: undefined,
    ...additionalParameters,
  };

  if (layers === null) {
    throw new Error('LayerId must be provided for WMS even if only evalscript or dataProduct is used');
  }
  queryParams.layers = layers;

  if (!params.bbox) {
    throw new Error('No bbox provided');
  }
  queryParams.bbox = `${params.bbox.minX},${params.bbox.minY},${params.bbox.maxX},${params.bbox.maxY}`;
  queryParams.srs = params.bbox.crs.authId;

  if (params.format) {
    queryParams.format = params.format as MimeType;
  }

  if (!params.fromTime) {
    queryParams.time = moment.utc(params.toTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
  } else {
    queryParams.time = `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${moment
      .utc(params.toTime)
      .format('YYYY-MM-DDTHH:mm:ss') + 'Z'}`;
  }

  if (params.width && params.height) {
    queryParams.width = params.width;
    queryParams.height = params.height;
  } else if (params.resx && params.resy) {
    queryParams.resx = params.resx;
    queryParams.resy = params.resy;
  } else {
    throw new Error('One of resx/resy or width/height must be provided');
  }

  if (evalscript || evalscriptUrl) {
    // on eo-cloud, datasource must be defined if we are using evalscript:
    if (!evalsource && baseUrl.startsWith('https://eocloud.sentinel-hub.com/')) {
      throw new Error('Dataset is not defined on this layer - are you using a correct subclass?');
    }
    queryParams.evalsource = evalsource;
  }

  if (evalscript) {
    if (typeof window !== 'undefined' && window.btoa) {
      queryParams.evalscript = btoa(evalscript);
    } else {
      // node.js doesn't support btoa:
      queryParams.evalscript = Buffer.from(evalscript, 'utf8').toString('base64');
    }
  }
  if (evalscriptUrl) {
    queryParams.evalscripturl = evalscriptUrl;
  }
  if (params.preview !== undefined) {
    queryParams.preview = params.preview;
  }
  if (params.geometry) {
    queryParams.geometry = WKT.convert(params.geometry);
  }
  if (params.quality) {
    queryParams.quality = params.quality;
  }
  if (params.nicename) {
    queryParams.nicename = params.nicename;
  }
  if (params.showlogo !== undefined) {
    queryParams.showlogo = params.showlogo;
  }
  if (params.bgcolor) {
    queryParams.bgcolor = params.bgcolor;
  }
  if (params.transparent !== undefined) {
    queryParams.transparent = params.transparent;
  }
  if (params.temporal) {
    queryParams.temporal = params.temporal;
  }

  const queryString = stringify(queryParams, { sort: false });

  // To avoid duplicate entries in query params, we perform a double check here, issuing
  // a warning if some unknown param should be ignored, but wasn't.
  const queryParamsKeys = Object.keys(queryParams);
  const unknownParamsKeys = Object.keys(params.unknown || {});
  const validUnknownParamsKeys = unknownParamsKeys.filter(k => !queryParamsKeys.includes(k));
  if (unknownParamsKeys.length !== validUnknownParamsKeys.length) {
    console.warn(
      "Some of the keys are missing from the list 'IGNORE_KNOWN_PARAMS', removing them. This is a problem with a library and should be fixed, please file a bug report.",
      { unknownParamsKeys, validUnknownParamsKeys },
    );
  }
  let unknownParams: Record<string, any> = {};
  for (let k of validUnknownParamsKeys) {
    unknownParams[k] = params.unknown[k];
  }
  const unknownParamsStr =
    unknownParams && Object.keys(unknownParams).length > 0
      ? '&' + stringify(unknownParams, { sort: false })
      : '';

  return `${baseUrl}?${queryString}${unknownParamsStr}`;
}
