import { BBox } from 'src/bbox';
import { CRS_IDS, CRS_EPSG4326, CRS_EPSG3857, CRS_WGS84, SUPPORTED_CRS_OBJ } from 'src/crs';
import { ApiType, MimeType, GetMapParams } from 'src/layer/const';
import { ServiceType } from 'src/layer/wms';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { LayersFactory } from 'src/layer/LayersFactory';
import { WmsLayer } from 'src/layer/WmsLayer';

export async function legacyGetMapFromUrl(
  urlWithQueryParams: string,
  api: ApiType = ApiType.WMS,
  fallbackToWmsApi: boolean = false,
): Promise<Blob> {
  const url = new URL(urlWithQueryParams);
  let params: Record<string, any> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const baseUrl = `${url.origin}${url.pathname}`;
  return legacyGetMapFromParams(baseUrl, params, api, fallbackToWmsApi);
}

export function legacyGetMapWmsUrlFromParams(baseUrl: string, wmsParams: Record<string, any>): string {
  const { layers, getMapParams } = parseLegacyWmsGetMapParams(wmsParams);
  const layer = new WmsLayer(baseUrl, layers);
  return layer.getMapUrl(getMapParams, ApiType.WMS);
}

export async function legacyGetMapFromParams(
  baseUrl: string,
  wmsParams: Record<string, any>,
  api: ApiType = ApiType.WMS,
  fallbackToWmsApi: boolean = false,
): Promise<Blob> {
  const { layers, evalscript, evalscriptUrl, evalsource, getMapParams } = parseLegacyWmsGetMapParams(
    wmsParams,
  );

  let layer;
  switch (api) {
    case ApiType.WMS:
      layer = new WmsLayer(baseUrl, layers);
      return layer.getMap(getMapParams, api);

    case ApiType.PROCESSING:
      try {
        // We try to use Processing API, but we can't guarantee that we will be able to translate all of
        // the parameters. If some of them are incompatible, we _don't_ render the possibly incorrect image,
        // but instead throw an exception. In this case, parameter 'fallbackToWmsApi' allows rendering image
        // using the regular WMS.

        // We use LayerFactory to construct the layer, but then change the evalscript if needed:
        const layerId = layers.split(',')[0];
        const layerFactoryResult = await LayersFactory.makeLayers(baseUrl, (lId: string) => lId === layerId);
        if (layerFactoryResult.length < 1) {
          throw new Error(`Layer with id ${layerId} was not found on service endpoint ${baseUrl}`);
        }
        layer = layerFactoryResult[0];
        if (!(layer instanceof AbstractSentinelHubV3Layer)) {
          throw new Error('Processing API is only possible with SH V3 layers');
        }
        if (evalscript) {
          const decodedEvalscript = atob(evalscript);
          if (!decodedEvalscript.startsWith('//VERSION=3')) {
            throw new Error(
              "To avoid possible bugs, legacy functions only allow evalscripts explicitly marked with '//VERSION=3' comment with Processing API",
            );
          }
          // we assume that devs don't do things like setting evalsource on a layer to something
          // that doesn't match layer's dataset - but we check it nevertheless:
          const expectedEvalsource = layer.dataset.shWmsEvalsource;
          if (expectedEvalsource !== evalsource) {
            throw new Error(
              `Evalsource ${evalsource} is not valid on this layer (was expecting ${expectedEvalsource})`,
            );
          }
          layer.setEvalscript(decodedEvalscript);
        } else if (evalscriptUrl) {
          // Processing API doesn't support evalscriptUrl, bail out:
          throw new Error('Parameter evalscriptUrl is not supported with Processing API');
        }
        if (wmsParams.gamma && Number(wmsParams.gamma).toFixed(1) !== '1.0') {
          throw new Error('Parameter gamma is not supported with Processing API');
        }
        if (wmsParams.gain && Number(wmsParams.gain).toFixed(1) !== '1.0') {
          throw new Error('Parameter gain is not supported with Processing API');
        }
        return layer.getMap(getMapParams, api);
      } catch (ex) {
        if (fallbackToWmsApi) {
          //console.debug(`Processing API could not be used, will retry with WMS. Error was: [${ex.message}]`)
          return legacyGetMapFromParams(baseUrl, wmsParams, ApiType.WMS);
        } else {
          throw ex;
        }
      }

    default:
      throw new Error('Only WMS and Processing API are supported with legacy functions');
  }
}

// *****************

const DEFAULT_OGC_VERSIONS = {
  WMS: '1.3.0',
  WCS: '1.1.2',
  WFS: '2.0.0',
};

type ParsedLegacyWmsGetMapParams = {
  layers: string;
  evalscript: string | null;
  evalscriptUrl: string | null;
  evalsource: string | null;
  getMapParams: GetMapParams;
};

function parseLegacyWmsGetMapParams(wmsParams: Record<string, any>): ParsedLegacyWmsGetMapParams {
  const params = convertKeysToLowercase(wmsParams);

  const layers = params.layers;

  const service = serviceFromParams(params);
  const version = versionFromParams(service, params);
  let crs = crsFromParams(service, params);
  const bbox = bboxFromParams(service, version, crs, params);
  const [fromTime, toTime] = timeFromParams(params);
  const format = mimeTypeFromParams(params);

  let getMapParams: GetMapParams = {
    bbox: bbox,
    fromTime: fromTime,
    toTime: toTime,
    format: format,
  };

  if (params.resx && params.resy) {
    const [resx, resy] = resXYFromParams(params);
    getMapParams.resx = resx;
    getMapParams.resy = resy;
  } else if (params.width && params.height) {
    const [width, height] = widthHeightFromParams(params);
    getMapParams.width = width;
    getMapParams.height = height;
  }

  // Instead of dealing with maxCC at this point, we pass it through as an unknown parameter. In the
  // future, it should be used to instantiate the layers instead.
  // if (params.maxcc) {
  //   getMapParams.maxCloudCoverPercent = parseInt(params.maxcc);
  // }

  if (params.preview) {
    getMapParams.preview = previewFromParams(params);
  }
  if (params.geometry) {
    getMapParams.geometry = params.geometry;
  }
  if (params.quality) {
    getMapParams.quality = parseInt(params.quality);
  }
  if (params.gain) {
    getMapParams.gain = parseFloat(params.gain);
  }
  if (params.gamma) {
    getMapParams.gamma = parseFloat(params.gamma);
  }
  if (params.nicename) {
    getMapParams.nicename = params.nicename;
  }
  if (params.showlogo) {
    getMapParams.showlogo = !['false', '0', 'no'].includes(params.showlogo.toLowerCase());
  }
  if (params.bgcolor) {
    getMapParams.bgcolor = bgcolorFromParams(params);
  }
  if (params.transparent) {
    getMapParams.transparent = ['true', '1', 'yes'].includes(params.transparent.toLowerCase());
  }
  if (params.temporal) {
    getMapParams.temporal = ['true', '1', 'yes'].includes(params.temporal.toLowerCase());
  }
  if (params.upsampling) {
    getMapParams.upsampling = params.upsampling;
  }
  if (params.downsampling) {
    getMapParams.downsampling = params.downsampling;
  }

  // let all other params through without cleaning - we don't know about them, but we will
  // pass them to WMS unchanged:
  const IGNORE_KNOWN_PARAMS = [
    'request',
    'layers',
    'service',
    'version',
    'crs',
    'srs',
    'srsname',
    'time',
    //'maxcc',
  ];
  const getMapParamsObjectKeys = Object.keys(getMapParams);
  let unknown: Record<string, string> = {};
  for (let [key, value] of Object.entries(params)) {
    if (getMapParamsObjectKeys.includes(key)) {
      // key is already taken care of, ignore it:
      continue;
    }
    if (IGNORE_KNOWN_PARAMS.includes(key)) {
      continue;
    }
    unknown[key] = value;
  }
  if (Object.keys(unknown).length > 0) {
    getMapParams.unknown = unknown;
  }

  return {
    layers: layers,
    evalscript: params.evalscript,
    evalscriptUrl: params.evalscriptUrl,
    evalsource: params.evalsource,
    getMapParams: getMapParams,
  };
}

function convertKeysToLowercase(o: Record<string, any>): Record<string, any> {
  let result: Record<string, any> = {};
  for (let [key, value] of Object.entries(o)) {
    result[key.toLowerCase().trim()] = '' + value;
  }
  return result;
}

function serviceFromParams(params: any): ServiceType {
  if (!params.service) {
    return ServiceType.WMS;
  }
  switch (params.service.toUpperCase()) {
    case ServiceType.WMS:
    case ServiceType.WCS:
    case ServiceType.WFS:
      return params.service.toUpperCase();
    default:
      throw new Error('Unknown service');
  }
}

function versionFromParams(service: ServiceType, params: any): string {
  return params.version ? params.version : DEFAULT_OGC_VERSIONS[service];
}

function crsFromParams(ogcService: ServiceType, params: any): CRS_IDS {
  let crs;
  switch (ogcService) {
    case ServiceType.WMS:
      crs = params.crs;
      break;
    case ServiceType.WCS:
      crs = params.srs;
      break;
    case ServiceType.WFS:
      crs = params.srsname;
      break;
  }
  if (!crs) {
    throw new Error('CRS not defined');
  }
  return crs;
}

function bboxFromParams(service: ServiceType, version: string, crsAuthId: CRS_IDS, params: any): BBox {
  if (!params.bbox) {
    throw new Error('Parameter bbox is mandatory');
  }
  const bboxStr: string = params.bbox;
  const coords = params.bbox instanceof Array ? params.bbox : bboxStr.split(',').map(c => parseFloat(c));
  const crs = SUPPORTED_CRS_OBJ[crsAuthId];
  let minX, minY, maxX, maxY;
  switch (crs) {
    case CRS_EPSG3857:
      [minX, minY, maxX, maxY] = coords;
      break;
    case CRS_EPSG4326:
    case CRS_WGS84:
      // https://www.sentinel-hub.com/faq/why-result-different-when-i-am-using-wms-or-wcs-when-coordinate-system-epsg4326
      // - WMS:
      //    - version 1.1.1: longitude, latitude
      //    - version 1.3.0: latitude, longitude
      // - WFS:
      //    - version 1.0.0: longitude, latitude
      //    - version 2.0.0: latitude, longitude
      // - WCS:
      //    - version 1.0.0: longitude, latitude
      if (
        (service === 'WMS' && version === '1.1.1') ||
        (service === 'WFS' && version === '1.0.0') ||
        (service === 'WCS' && version === '1.0.0')
      ) {
        [minX, minY, maxX, maxY] = coords;
      } else {
        [minY, minX, maxY, maxX] = coords;
      }
      break;
    default:
      throw new Error('Unsupported CRS - bbox could not be parsed');
  }
  // SH services support switched min & max X/Y, but we don't:
  [minX, maxX] = [Math.min(minX, maxX), Math.max(minX, maxX)];
  [minY, maxY] = [Math.min(minY, maxY), Math.max(minY, maxY)];
  return new BBox(crs, minX, minY, maxX, maxY);
}

function isTimeSpecifiedInDate(dateStr: string): boolean {
  // It would be better if we could somehow tell Date to parse the object with default
  // values, but there doesn't seem to be a way. Still, this should cover most cases:
  return dateStr.length > 'YYYY-MM-DD '.length;
}

function timeFromParams(params: any): Date[] {
  // https://www.sentinel-hub.com/develop/documentation/api/ogc_api/wms-parameters
  // TIME: (when REQUEST = GetMap or GetFeatureInfo) The time or time range for which to
  // return the results, in ISO8601 format (year-month-date, for example: 2016-01-01). It is
  // advised to set time as a time range, e.g. 2016-01-01/2016-01-31 to select image from
  // January 2016 or 2016-01-01/2016-01-01 to select image on 1st of January 2016. When a
  // single time is specified the service will return data from beginning of satellite mission
  // until the specified time (e.g. 2015-01-01 to 2016-01-01). If a time range is specified
  // the result is based on all scenes between the specified dates conforming to the cloud
  // coverage criteria and stacked based on priority setting - e.g. most recent on top.
  // Optional, default: none (the last valid image is returned).
  // Examples: "TIME=2016-01-01/2016-02-01/P1D".
  if (!params.time) {
    // "Optional, default: none (the last valid image is returned)."
    // We ignore this - these functions deal with legacy code and there seems to be no code
    // that wouldn't specify time. Still, let's reject explicitly:
    throw new Error('Time not specified');
  }
  const timeParts = params.time.split('/');
  let fromTime, toTime;
  if (timeParts.length >= 2) {
    fromTime = new Date(timeParts[0]);
    toTime = new Date(timeParts[1]);
    if (!isTimeSpecifiedInDate(timeParts[1])) {
      toTime.setUTCHours(23, 59, 59, 999);
    }
  } else if (timeParts.length === 1) {
    // "When a single time is specified the service will return data from beginning of
    //  satellite mission until the specified time"
    fromTime = new Date('1970-01-01');
    toTime = new Date(timeParts[0]);
    if (!isTimeSpecifiedInDate(timeParts[0])) {
      toTime.setUTCHours(23, 59, 59, 999);
    }
  }

  return [new Date(fromTime), new Date(toTime)];
}

function mimeTypeFromParams(params: any): MimeType {
  return params.format ? params.format : 'image/png';
}

function resXYFromParams(params: any): string[] {
  return [params.resx, params.resy];
}

function widthHeightFromParams(params: any): number[] {
  return [Number.parseInt(params.width), Number.parseInt(params.height)];
}

function previewFromParams(params: any): number {
  // WMS parameter description:
  //   https://www.sentinel-hub.com/develop/documentation/api/preview-modes
  // In the Processing API the values are enums:
  //   - 0 -> DETAIL
  //   - 1 -> PREVIEW
  //   - 2 -> EXTENDED_PREVIEW
  //   - 3 -> EXTENDED_PREVIEW (used, but not officially supported)
  if (!params.preview) {
    // this setting allows zoomed-out previews on Processing API, otherwise we get bounds-too-big errors
    // (this parameter was set directly on layers for the old instances)
    return 2;
  }
  return Math.min(Math.max(Number.parseInt(params.preview), 0), 3);
}

function bgcolorFromParams(params: any): string {
  // WMS allows setting bgcolor, while Processing API doesn't; since the default for Processing is
  // black, we set it in WMS to black too
  if (!params.bgcolor) {
    return '000000';
  }
  return params.bgcolor;
}
