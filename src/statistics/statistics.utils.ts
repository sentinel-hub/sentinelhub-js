import { DailyChannelStats, Stats } from '../layer/const';
import {
  StatisticalApiInputPayload,
  StatisticalApiAggregationPayload,
  StatisticalApiCalculationsPayload,
  StatisticalApiOutput,
  StatisticalApiResponse,
} from './const';

import { AbstractSentinelHubV3Layer } from '../layer/AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { createProcessingPayload } from '../layer/processing';

function convertToFISResponse(data: StatisticalApiResponse, defaultOutput: string = 'default'): Stats {
  //array of stats objects (interval+outputs)
  const statisticsPerBand = new Map<string, DailyChannelStats[]>();

  for (let statObject of data) {
    const date = new Date(statObject.interval.from);
    const { outputs } = statObject;
    const outputId =
      Object.keys(outputs).find((output) => output === defaultOutput) || Object.keys(outputs)[0];
    const outputData = outputs[outputId];
    const { bands } = outputData;

    Object.keys(bands).forEach((band) => {
      const { stats } = bands[band];

      const dailyStats: DailyChannelStats = {
        date: date,
        basicStats: stats,
      };
      // statistical api doesn't support equal frequency histograms so we try to
      // create them from percentiles
      if (!!stats.percentiles) {
        const lowEdges = Object.keys(stats.percentiles).sort((a, b) => parseFloat(a) - parseFloat(b));
        const bins = [stats.min, ...lowEdges.map((lowEdge: any) => stats.percentiles[lowEdge])].map(
          (value) => ({
            lowEdge: value,
            mean: null,
            count: null,
          }),
        );

        dailyStats.histogram = {
          bins: bins,
        };
      }

      //remove percentiles from basic stats
      delete stats.percentiles;

      let dcs: DailyChannelStats[] = [];
      if (statisticsPerBand.has(band)) {
        dcs = statisticsPerBand.get(band);
      }
      dcs.push(dailyStats);
      statisticsPerBand.set(band, dcs);
    });
  }

  const result: Stats = {};

  for (let band of statisticsPerBand.keys()) {
    const bandStats = statisticsPerBand.get(band);
    //bands in FIS response are
    // - prefixed with C
    // - sorted descending
    result[band.replace('B', 'C')] = bandStats.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }

  return result;
}

async function createInputPayload(
  layer: AbstractSentinelHubV3Layer,
  params: any,
  reqConfig: RequestConfiguration,
): Promise<StatisticalApiInputPayload> {
  const processingPayload = createProcessingPayload(
    layer.dataset,
    { ...params },
    layer.getEvalscript(),
    layer.getDataProduct(),
    layer.mosaickingOrder,
    layer.upsampling,
    layer.downsampling,
  );
  const updatedProcessingPayload = await layer._updateProcessingGetMapPayload(
    processingPayload,
    0,
    reqConfig,
  );
  const { input } = updatedProcessingPayload;
  return input;
}

function createAggregationPayload(
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
      of: params.aggregationInterval,
    },
    resx: resX,
    resy: resY,
    evalscript: layer.getEvalscript(),
  };

  return payload;
}

function createCalculationsPayload(
  layer: AbstractSentinelHubV3Layer,
  params: any,
  output: string = 'default',
): StatisticalApiCalculationsPayload {
  //calculate percentiles for selected output

  const statisticsForAllBands: StatisticalApiOutput = {
    statistics: {
      //If it is "default", the statistics specified below will be calculated for all bands of this output
      default: {
        percentiles: {
          k: Array.from({ length: params.bins - 1 }, (_, i) => ((i + 1) * 100) / params.bins),
        },
      },
    },
  };

  return {
    [output]: statisticsForAllBands,
  };
}

export const StatisticsUtils = {
  convertToFISResponse: convertToFISResponse,
  createInputPayload: createInputPayload,
  createAggregationPayload: createAggregationPayload,
  createCalculationsPayload: createCalculationsPayload,
};
