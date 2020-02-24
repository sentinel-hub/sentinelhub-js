import axios from 'axios';

import { GetMapParams, ApiType, Tile, PaginatedTiles, FlyoverInterval } from 'src/layer/const';
import { BBox } from 'src/bbox';
import { Dataset } from 'src/layer/dataset';
import { RequestConfig } from 'src/utils/axiosInterceptors';
import intersect from '@turf/intersect';
import area from '@turf/area';
import union from '@turf/union';  // @turf/union is missing types definitions, we supply them separately

import { Polygon, MultiPolygon } from '@turf/helpers';

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

  public findFlyoverIntervals(bbox: BBox, tiles: Tile[]): FlyoverInterval[] {
    if (!this.dataset || !this.dataset.orbitTimeMinutes) {
      throw new Error('Orbit time is needed for grouping tiles into flyovers.');
    }

    tiles.sort((a, b) => a.sensingTime.getTime() - b.sensingTime.getTime());
    let orbitTimeMS = this.dataset.orbitTimeMinutes * 60 * 1000;
    let flyoverIntervals: FlyoverInterval[] = [];

    let flyoverIndex = 0;
    let currentFlyoverGeometry = null;
    for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
      if (tileIndex === 0) {
        flyoverIntervals[flyoverIndex] = {
          fromTime: tiles[tileIndex].sensingTime,
          toTime: tiles[tileIndex].sensingTime,
          coveragePercent: 0,
        };
        currentFlyoverGeometry = tiles[tileIndex].geometry;
        continue;
      }

      const prevDateMS = tiles[tileIndex - 1].sensingTime.getTime();
      const currDateMS = tiles[tileIndex].sensingTime.getTime();
      const diffMS = Math.abs(prevDateMS - currDateMS);

      if (diffMS < orbitTimeMS) {
        flyoverIntervals[flyoverIndex].toTime = tiles[tileIndex].sensingTime;
        currentFlyoverGeometry = union(currentFlyoverGeometry, tiles[tileIndex].geometry);
      } else {
        flyoverIntervals[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
          bbox,
          currentFlyoverGeometry,
        );
        flyoverIndex++;
        flyoverIntervals[flyoverIndex] = {
          fromTime: tiles[tileIndex].sensingTime,
          toTime: tiles[tileIndex].sensingTime,
          coveragePercent: 0,
        };
        currentFlyoverGeometry = tiles[tileIndex].geometry;
      }
    }
    if (flyoverIntervals.length > 0) {
      flyoverIntervals[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
        bbox,
        currentFlyoverGeometry,
      );
    }
    return flyoverIntervals;
  }

  private calculateCoveragePercent(bbox: BBox, flyoverGeometry: Polygon | MultiPolygon): number {
    const bboxGeometry: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [bbox.minX, bbox.minY],
          [bbox.maxX, bbox.minY],
          [bbox.maxX, bbox.maxY],
          [bbox.minX, bbox.maxY],
          [bbox.minX, bbox.minY],
        ],
      ],
    };
    const bboxedFlyoverGeometry = intersect(bboxGeometry, flyoverGeometry);
    return (area(bboxedFlyoverGeometry) / area(bboxGeometry)) * 100;
  }

  public async updateLayerFromServiceIfNeeded(): Promise<void> {}
}
