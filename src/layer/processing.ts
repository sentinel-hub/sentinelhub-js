import axios from 'axios';
import { Polygon, BBox as BBoxTurf } from '@turf/helpers';

import { getAuthToken } from 'src/auth';
import { MimeType, GetMapParams, Interpolator } from 'src/layer/const';
import { Dataset } from 'src/layer/dataset';

enum PreviewMode {
  DETAIL = 'DETAIL',
  PREVIEW = 'PREVIEW',
  EXTENDED_PREVIEW = 'EXTENDED_PREVIEW',
}
enum MosaickingOrder {
  MOST_RECENT = 'mostRecent',
  LEAST_RECENT = 'leastRecent',
  LEAST_CC = 'leastCC',
}

type ProcessingPayload = {
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
          maxCloudCoverage: number;
          previewMode?: PreviewMode;
          mosaickingOrder?: MosaickingOrder;
        };
        processing?: {
          upsampling?: Interpolator;
          downsampling?: Interpolator;
        };
        type: string;
      }
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
      }
    ];
  };
  evalscript?: string;
  dataProduct?: string;
};

export async function processingGetMap(
  dataset: Dataset,
  params: GetMapParams,
  evalscript: string | null = null,
  dataProduct: string | null = null,
): Promise<Blob> {
  const authToken = getAuthToken();
  if (!authToken) {
    throw new Error('Must be authenticated to use Processing API');
  }

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
            maxCloudCoverage: params.maxCCPercent, // maximum allowable cloud coverage in percent
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
        payload.input.data[0].dataFilter.previewMode = PreviewMode.DETAIL;
        break;
      case 1:
        payload.input.data[0].dataFilter.previewMode = PreviewMode.PREVIEW;
        break;
      case 2:
      case 3:
      default:
        payload.input.data[0].dataFilter.previewMode = PreviewMode.EXTENDED_PREVIEW;
        break;
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

  const response = await axios.post(`${dataset.shServiceHostname}api/v1/process`, payload, {
    headers: {
      Authorization: 'Bearer ' + authToken,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    responseType: 'blob',
    params: {
      useCache: true,
      retries: 5,
    },
  });
  return response.data;
}
