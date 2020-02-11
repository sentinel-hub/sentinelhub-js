import axios from 'axios';

import { GetMapParams, ApiType, Tile, PaginatedTiles, FlyoverInterval } from 'src/layer/const';
import { BBox } from 'src/bbox';
import { Dataset } from 'src/layer/dataset';
import { RequestConfig } from 'src/utils/axiosInterceptors';

export class AbstractLayer {
  public title: string | null = null;
  public description: string | null = null;
  public readonly dataset: Dataset | null = null;

  public constructor(title: string | null = null, description: string | null = null) {
    this.title = title;
    this.description = description;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getMap(params: GetMapParams, api: ApiType): Promise<Blob> {
    switch (api) {
      case ApiType.WMS:
        const url = this.getMapUrl(params, api);
        const requestConfig: RequestConfig = { responseType: 'blob', useCache: true };
        const response = await axios.get(url, requestConfig);
        return response.data;
      default:
        const className = this.constructor.name;
        throw new Error(`API type "${api}" not supported in ${className}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getMapUrl(params: GetMapParams, api: ApiType): string {
    throw new Error('Not implemented');
  }

  public async findTiles(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount: number = 50, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset: number = 0, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    throw new Error('Not implemented yet');
  }

  public findFlyoverIntervals(tiles: Tile[]): FlyoverInterval[] {
    if (!this.dataset || !this.dataset.orbitTimeMinutes) {
      throw new Error('Orbit time is needed for grouping tiles into flyovers.');
    }

    tiles.sort((a, b) => a.sensingTime.getTime() - b.sensingTime.getTime());
    let orbitTimeMS = this.dataset.orbitTimeMinutes * 60 * 1000;
    let flyoverIntervals: FlyoverInterval[] = [];

    let j = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (i === 0) {
        flyoverIntervals[j] = {
          fromTime: tiles[i].sensingTime,
          toTime: tiles[i].sensingTime,
        };
        continue;
      }

      const prevDateMS = tiles[i - 1].sensingTime.getTime();
      const currDateMS = tiles[i].sensingTime.getTime();
      const diffMS = Math.abs(prevDateMS - currDateMS);

      if (diffMS < orbitTimeMS) {
        flyoverIntervals[j].toTime = tiles[i].sensingTime;
      } else {
        j++;
        flyoverIntervals[j] = {
          fromTime: tiles[i].sensingTime,
          toTime: tiles[i].sensingTime,
        };
      }
    }
    return flyoverIntervals;
  }

  public findDates(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    // any additional
  ): Promise<Date[]> {
    throw new Error('Not implemented yet');
  }
}
