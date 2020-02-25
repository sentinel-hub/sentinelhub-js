import axios from 'axios';

import { GetMapParams, ApiType, Tile, PaginatedTiles, FlyoverInterval } from 'src/layer/const';
import { BBox } from 'src/bbox';
import { Dataset } from 'src/layer/dataset';
import { RequestConfig } from 'src/utils/axiosInterceptors';
import intersect from '@turf/intersect';
import area from '@turf/area';
import union from '@turf/union'; // @turf/union is missing types definitions, we supply them separately

import { Polygon, MultiPolygon } from '@turf/helpers';
import { CRS_EPSG4326 } from 'src/crs';

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

  public async findFlyovers(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxFindTilesRequests: number = 50,
    tilesPerRequest: number = 50,
  ): Promise<FlyoverInterval[]> {
    if (!this.dataset || !this.dataset.orbitTimeMinutes) {
      throw new Error('Orbit time is needed for grouping tiles into flyovers.');
    }

    if (bbox.crs !== CRS_EPSG4326) {
      throw new Error('Currently, only EPSG:4326 in findFlyovers');
    }

    let tiles: Tile[] = [];
    for (let i = 0; i < maxFindTilesRequests; i++) {
      const { tiles: partialTiles, hasMore } = await this.findTiles(
        bbox,
        fromTime,
        toTime,
        tilesPerRequest,
        i * tilesPerRequest,
      );
      tiles = tiles.concat(partialTiles);
      if (!hasMore) {
        break;
      }
      if (i + 1 === maxFindTilesRequests) {
        throw new Error(
          `Could not fetch all the tiles in [${maxFindTilesRequests}] requests for [${tilesPerRequest}] tiles`,
        );
      }
    }

    tiles.sort((a, b) => a.sensingTime.getTime() - b.sensingTime.getTime());
    let orbitTimeMS = this.dataset.orbitTimeMinutes * 60 * 1000;
    let flyoverIntervals: FlyoverInterval[] = [];

    let flyoverIndex = 0;
    let currentFlyoverGeometry = null;
    let nTilesInFlyover = 0;
    let sumCloudCoverPercent = undefined;
    for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
      if (tileIndex === 0) {
        flyoverIntervals[flyoverIndex] = {
          fromTime: tiles[tileIndex].sensingTime,
          toTime: tiles[tileIndex].sensingTime,
          coveragePercent: 0,
          meta: {},
        };
        currentFlyoverGeometry = tiles[tileIndex].geometry;
        sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
        nTilesInFlyover = 1;
        continue;
      }

      const prevDateMS = tiles[tileIndex - 1].sensingTime.getTime();
      const currDateMS = tiles[tileIndex].sensingTime.getTime();
      const diffMS = Math.abs(prevDateMS - currDateMS);

      if (diffMS < orbitTimeMS) {
        flyoverIntervals[flyoverIndex].toTime = tiles[tileIndex].sensingTime;
        currentFlyoverGeometry = union(currentFlyoverGeometry, tiles[tileIndex].geometry);
        sumCloudCoverPercent =
          sumCloudCoverPercent !== undefined
            ? sumCloudCoverPercent + tiles[tileIndex].meta.cloudCoverPercent
            : undefined;
        nTilesInFlyover++;
      } else {
        flyoverIntervals[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
          bbox,
          currentFlyoverGeometry,
        );
        if (sumCloudCoverPercent !== undefined) {
          flyoverIntervals[flyoverIndex].meta.averageCloudCoverPercent =
            sumCloudCoverPercent / nTilesInFlyover;
        }

        flyoverIndex++;
        flyoverIntervals[flyoverIndex] = {
          fromTime: tiles[tileIndex].sensingTime,
          toTime: tiles[tileIndex].sensingTime,
          coveragePercent: 0,
          meta: {},
        };
        currentFlyoverGeometry = tiles[tileIndex].geometry;
        sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
        nTilesInFlyover = 1;
      }
    }
    if (flyoverIntervals.length > 0) {
      flyoverIntervals[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
        bbox,
        currentFlyoverGeometry,
      );
      if (sumCloudCoverPercent !== undefined) {
        flyoverIntervals[flyoverIndex].meta.averageCloudCoverPercent = sumCloudCoverPercent / nTilesInFlyover;
      }
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
