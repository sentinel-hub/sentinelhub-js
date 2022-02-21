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
