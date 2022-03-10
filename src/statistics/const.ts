import { Polygon, BBox as BBoxTurf, MultiPolygon } from '@turf/helpers';

import { ProcessingPayloadDatasource } from '../layer/processing';

export type StatisticalApiInputPayload = {
  bounds: {
    bbox?: BBoxTurf;
    geometry?: Polygon | MultiPolygon;
    properties: {
      crs: string;
    };
  };
  data: ProcessingPayloadDatasource[];
};

export type StatisticalApiAggregationPayload = {
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

export type StatisticalApiOutput = {
  histograms?: any;
  statistics?: any;
};

export type StatisticalApiCalculationsPayload = {
  [output: string]: StatisticalApiOutput;
};

export type StatisticalApiPayload = {
  input: StatisticalApiInputPayload;
  aggregation: StatisticalApiAggregationPayload;
  calculations: StatisticalApiCalculationsPayload;
};

type StatisticalApiResponseError = 'BAD_REQUEST' | 'EXECUTION_ERROR' | 'TIMEOUT';

type StatisticalApiResponseInterval = {
  from: string;
  to: string;
};

export type BandHistogram = {
  overflow: number;
  underflow: number;
  bins: {
    lowEdge: number;
    mean: number;
    count: number;
  }[];
};

export type BandStats = {
  min: number;
  max: number;
  mean: number;
  stDev: number;
  sampleCount: number;
  noDataCount: number;
  percentiles?: {
    [percentile: string]: number;
  };
};

type BandsType = {
  [band: string]: {
    stats: BandStats;
    histogram?: BandHistogram;
  };
};

export type StatisticalApiResponse = {
  interval: StatisticalApiResponseInterval;
  outputs: {
    [output: string]: {
      bands: BandsType;
    };
  };

  error?: StatisticalApiResponseError;
}[];
