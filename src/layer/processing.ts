import axios, { AxiosRequestConfig } from 'axios';
import { Polygon, BBox as BBoxTurf, MultiPolygon } from '@turf/helpers';

import { getAuthToken } from 'src/auth';

import { MimeType, GetMapParams, Interpolator, PreviewMode, MosaickingOrder } from 'src/layer/const';
import { Dataset } from 'src/layer/dataset';
import { getAxiosReqParams, RequestConfiguration } from 'src/utils/cancelRequests';
import { DEFAULT_CACHE_CONFIG } from 'src/utils/cacheHandlers';

enum PreviewModeString {
  DETAIL = 'DETAIL',
  PREVIEW = 'PREVIEW',
  EXTENDED_PREVIEW = 'EXTENDED_PREVIEW',
}

export type ProcessingPayload = {
  input: {
    bounds: {
      bbox?: BBoxTurf;
      geometry?: Polygon | MultiPolygon;
      properties: {
        crs: string;
      };
    };
    data: ProcessingPayloadDatasource[];
  };
  output: {
    width: number;
    height: number;
    responses: [
      {
        identifier: string;
        format: {
          type: MimeType;
        };
      },
    ];
  };
  evalscript?: string;
  dataProduct?: string;
};

export type ProcessingPayloadDatasource = {
  id?: string;
  dataFilter: {
    timeRange: {
      from: string;
      to: string;
    };
    previewMode?: PreviewModeString;
    mosaickingOrder?: MosaickingOrder;
    [key: string]: any;
  };
  processing?: {
    upsampling?: Interpolator;
    downsampling?: Interpolator;
    [key: string]: any;
  };
  type: string;
};

export function convertPreviewToString(preview: PreviewMode): PreviewModeString {
  // WMS parameter description:
  //   https://www.sentinel-hub.com/develop/documentation/api/preview-modes
  // In the Processing API the values are enums:
  //   - 0 -> DETAIL
  //   - 1 -> PREVIEW
  //   - 2 -> EXTENDED_PREVIEW
  //   - 3 -> EXTENDED_PREVIEW (used, but not officially supported)
  switch (preview) {
    case 0:
      return PreviewModeString.DETAIL;
    case 1:
      return PreviewModeString.PREVIEW;
    case 2:
    case 3:
      return PreviewModeString.EXTENDED_PREVIEW;
    default:
      throw new Error(
        'Preview mode does not exist, options are 0 (DETAIL), 1 (PREVIEW) or 2/3 (EXTENDED_PREVIEW)',
      );
  }
}

export function createProcessingPayload(
  dataset: Dataset,
  params: GetMapParams,
  evalscript: string | null = null,
  dataProduct: string | null = null,
  mosaickingOrder: MosaickingOrder | null = null,
  upsampling: Interpolator | null = null,
  downsampling: Interpolator | null = null,
): ProcessingPayload {
  const { bbox } = params;

  const payload: ProcessingPayload = {
    input: {
      bounds: {
        bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
        properties: {
          crs: params.bbox.crs.opengisUrl,
        },
      },
      data: [
        {
          dataFilter: {
            timeRange: {
              from: params.fromTime.toISOString(),
              to: params.toTime.toISOString(),
            },
            mosaickingOrder: mosaickingOrder ? mosaickingOrder : MosaickingOrder.MOST_RECENT,
          },
          processing: {},
          type: dataset.shProcessingApiDatasourceAbbreviation,
        },
      ],
    },
    output: {
      width: params.width,
      height: params.height,
      responses: [
        {
          identifier: 'default',
          format: {
            type: params.format,
          },
        },
      ],
    },
  };

  if (params.upsampling || upsampling) {
    payload.input.data[0].processing.upsampling = params.upsampling ? params.upsampling : upsampling;
  }
  if (params.downsampling || downsampling) {
    payload.input.data[0].processing.downsampling = params.downsampling ? params.downsampling : downsampling;
  }
  if (params.geometry !== undefined) {
    payload.input.bounds.geometry = params.geometry;
  }

  if (params.preview !== undefined) {
    payload.input.data[0].dataFilter.previewMode = convertPreviewToString(params.preview);
  }

  //dataProduct should not be set if evalscript is passed as parameter
  if (evalscript) {
    payload.evalscript = evalscript;
  } else if (dataProduct) {
    payload.dataProduct = dataProduct;
    payload.evalscript = ''; // evalscript must not be null
  } else {
    throw new Error('Either evalscript or dataProduct should be defined with Processing API');
  }

  return payload;
}

export async function processingGetMap(
  shServiceHostname: string,
  payload: ProcessingPayload,
  reqConfig: RequestConfiguration,
): Promise<Blob> {
  const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
  if (!authToken) {
    throw new Error('Must be authenticated to use Processing API');
  }

  const requestConfig: AxiosRequestConfig = {
    headers: {
      Authorization: 'Bearer ' + authToken,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    // 'blob' responseType does not work with Node.js:
    responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer',
    cache: DEFAULT_CACHE_CONFIG,
    ...getAxiosReqParams(reqConfig),
  };
  const response = await axios.post(`${shServiceHostname}api/v1/process`, payload, requestConfig);
  return response.data;
}
