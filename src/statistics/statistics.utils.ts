import { Stats, DailyChannelStats } from '../layer/const';

import { StatisticalApiResponse } from './StatisticalApiTypes';

function convertToFISResponse(data: StatisticalApiResponse, defaultOutput: string = 'default'): Stats {
  //array of stats objects (interval+outputs)
  const statisticsPerBand = new Map<string, DailyChannelStats[]>();

  for (let statObject of data) {
    const date = new Date(statObject.interval.from);
    const { outputs } = statObject;
    const outputId = Object.keys(outputs).find(output => output === defaultOutput) || Object.keys(outputs)[0];
    const outputData = outputs[outputId];
    const { bands } = outputData;

    Object.keys(bands).forEach(band => {
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
          value => ({
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

export const StatisticsUtils = {
  convertToFISResponse: convertToFISResponse,
};
