import { Polygon, BBox as BBoxTurf, MultiPolygon } from '@turf/helpers';
import { MosaickingOrder } from '../layer/const';

import { ProcessingPayloadDatasource } from '../layer/processing';
import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { CRS_EPSG4326 } from '../crs';
import { RequestConfiguration } from '../utils/cancelRequests';

type StatisticalApiInputPayload = {
  bounds: {
    bbox?: BBoxTurf;
    geometry?: Polygon | MultiPolygon;
    properties: {
      crs: string;
    };
  };
  data: ProcessingPayloadDatasource[];
};

export async function createInputPayload(
  layer: AbstractSentinelHubV3Layer,
  params: any,
  reqConfig: RequestConfiguration,
): Promise<StatisticalApiInputPayload> {
  const payload: StatisticalApiInputPayload = {
    bounds: {
      properties: {
        crs: params.bbox ? CRS_EPSG4326.opengisUrl : params.crs ? params.crs.opengisUrl : null,
      },
    },
    data: [
      {
        dataFilter: {
          timeRange: {
            from: params.fromTime.toISOString(),
            to: params.toTime.toISOString(),
          },
          mosaickingOrder: layer.mosaickingOrder ? layer.mosaickingOrder : MosaickingOrder.MOST_RECENT,
        },
        processing: {},
        type: layer.dataset.shProcessingApiDatasourceAbbreviation,
      },
    ],
  };

  if (params.bbox) {
    payload.bounds.bbox = [params.bbox.minX, params.bbox.minY, params.bbox.maxX, params.bbox.maxY];
  } else if (params.geometry) {
    payload.bounds.geometry = params.geometry;
  }

  if (params.upsampling || layer.upsampling) {
    payload.data[0].processing.upsampling = params.upsampling ? params.upsampling : layer.upsampling;
  }
  if (params.downsampling || layer.downsampling) {
    payload.data[0].processing.downsampling = params.downsampling ? params.downsampling : layer.downsampling;
  }

  const processingPayload = await layer._updateProcessingGetMapPayload(
    { input: payload, output: null },
    0,
    reqConfig,
  );
  const { input } = processingPayload;

  return input;
}

type StatisticalApiAggregationPayload = {
  timeRange: {
    from: string;
    to: string;
  };
  aggregationInterval: {
    of: string;
  };
  width?: number;
  height?: number;
  resx?: number;
  resy?: number;
  evalscript: string;
};

export function createAggregationPayload(
  layer: AbstractSentinelHubV3Layer,
  params: any,
): StatisticalApiAggregationPayload {
  if (!params.fromTime) {
    throw new Error('fromTime must be defined');
  }

  if (!params.toTime) {
    throw new Error('toTime must be defined');
  }

  if (!params.aggregationInterval) {
    throw new Error('aggregationInterval must be defined');
  }
  const resX = params.resolution;
  const resY = params.resolution;

  const payload: StatisticalApiAggregationPayload = {
    timeRange: {
      from: params.fromTime.toISOString(),
      to: params.toTime.toISOString(),
    },
    aggregationInterval: {
      of: params.aggregationInterval ? params.aggregationInterval : 'P1D',
    },
    resx: resX,
    resy: resY,
    evalscript: layer.getEvalscript(),
  };

  return payload;
}

type StatisticalApiOutput = {
  histograms?: any;
  statistics?: any;
};

type StatisticalApiCalculationsPayload = {
  [output: string]: StatisticalApiOutput;
};

type StatisticalApiPayload = {
  input: StatisticalApiInputPayload;
  aggregation: StatisticalApiAggregationPayload;
  calculations: StatisticalApiCalculationsPayload;
};

export function createCalculationsPayload(
  layer: AbstractSentinelHubV3Layer,
  params: any,
  output?: string,
): StatisticalApiCalculationsPayload {
  const outputId = output ? output : 'default';
  const defaultOutput: StatisticalApiOutput = {
    histograms: {
      default: {
        nBins: params.bins,
      },
    },
  };

  return {
    [outputId]: defaultOutput,
  };
}
