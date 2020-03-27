import axios, { AxiosRequestConfig } from 'axios';
import { Polygon, BBox as BBoxTurf } from '@turf/helpers';

import { getAuthToken } from 'src/auth';
import { MimeType, GetMapParams, Interpolator } from 'src/layer/const';
import { Dataset } from 'src/layer/dataset';

enum MosaickingOrder {
  MOST_RECENT = 'mostRecent',
  LEAST_RECENT = 'leastRecent',
  LEAST_CC = 'leastCC',
}

enum PreviewModeString {
  DETAIL = 'DETAIL',
  PREVIEW = 'PREVIEW',
  EXTENDED_PREVIEW = 'EXTENDED_PREVIEW',
}

export type ProcessingPayload = {
  input: {
    bounds: {
      bbox?: BBoxTurf;
      geometry?: Polygon;
      properties: {
        crs: string;
      };
    };
    data: [
      {
        location?: string;
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
      },
    ];
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

export function createProcessingPayload(
  dataset: Dataset,
  params: GetMapParams,
  evalscript: string | null = null,
  dataProduct: string | null = null,
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
            mosaickingOrder: MosaickingOrder.MOST_RECENT,
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

  if (params.upsampling !== undefined) {
    payload.input.data[0].processing.upsampling = params.upsampling;
  }
  if (params.downsampling !== undefined) {
    payload.input.data[0].processing.downsampling = params.downsampling;
  }

  if (params.preview !== undefined) {
    // WMS parameter description:
    //   https://www.sentinel-hub.com/develop/documentation/api/preview-modes
    // In the Processing API the values are enums:
    //   - 0 -> DETAIL
    //   - 1 -> PREVIEW
    //   - 2 -> EXTENDED_PREVIEW
    //   - 3 -> EXTENDED_PREVIEW (used, but not officially supported)
    switch (params.preview) {
      case 0:
        payload.input.data[0].dataFilter.previewMode = PreviewModeString.DETAIL;
        break;
      case 1:
        payload.input.data[0].dataFilter.previewMode = PreviewModeString.PREVIEW;
        break;
      case 2:
      case 3:
        payload.input.data[0].dataFilter.previewMode = PreviewModeString.EXTENDED_PREVIEW;
        break;
      default:
        throw new Error('Preview mode does not exist, options are "DETAIL", "PREVIEW" or "EXTENDED_PREVIEW"');
    }
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

export async function processingGetMap(shServiceHostname: string, payload: ProcessingPayload): Promise<Blob> {
  const authToken = getAuthToken();
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
    useCache: true,
  };
  const response = await axios.post(`${shServiceHostname}api/v1/process`, payload, requestConfig);
  return response.data;
}
