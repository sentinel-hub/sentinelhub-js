import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import area from '@turf/area';
import { union, intersection, Geom } from 'polygon-clipping';

import { BBox } from 'src/bbox';
import { CRS_EPSG4326 } from 'src/crs';
import { GetMapParams, ApiType, PaginatedTiles, FlyoverInterval } from 'src/layer/const';
import { Dataset } from 'src/layer/dataset';
import { getAxiosReqParams, RequestConfiguration } from 'src/utils/cancelRequests';
import { runPredefinedEffectFunctions } from 'src/mapDataManipulation/runPreparedEffects';

interface ConstructorParameters {
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
}

export class AbstractLayer {
  public title: string | null = null;
  public description: string | null = null;
  public readonly dataset: Dataset | null = null;
  public legendUrl: string | null = null;

  public constructor({ title = null, description = null, legendUrl = null }: ConstructorParameters) {
    this.title = title;
    this.description = description;
    this.legendUrl = legendUrl;
  }

  public async getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob> {
    switch (api) {
      case ApiType.WMS:
        // When API type is set to WMS, getMap() uses getMapUrl() with the same provided parameters for
        //   getting the url of the image.
        // getMap() changes the received image according to provided gain and gamma after it is received.
        // An error is thrown in getMapUrl() in case gain and gamma are present, because:
        // - we don't send gain and gamma to the services as they may not be supported there and we don't want
        //    to deceive the users with returning the image where gain and gamma were ignored
        // - if they are supported on the services, gain and gamma would be applied twice in getMap() if they
        //    were sent to the services in getMapUrl()
        // This is a dirty fix, but gain and gamma need to be removed from the parameters in getMap() so the
        //   errors in getMapUrl() are not triggered.
        let gain, gamma;
        if (params.gain) {
          gain = params.gain;
          params.gain = undefined;
        }
        if (params.gamma) {
          gamma = params.gamma;
          params.gamma = undefined;
        }

        const url = this.getMapUrl(params, api);
        const requestConfig: AxiosRequestConfig = {
          // 'blob' responseType does not work with Node.js:
          responseType: typeof window !== 'undefined' && window.Blob ? 'blob' : 'arraybuffer',
          useCache: true,
          ...getAxiosReqParams(reqConfig),
        };
        const response = await axios.get(url, requestConfig);
        let blob = response.data;
        blob = await runPredefinedEffectFunctions(blob, { gain: gain, gamma: gamma });

        return blob;
      default:
        const className = this.constructor.name;
        throw new Error(`API type "${api}" not supported in ${className}`);
    }
  }

  public supportsApiType(api: ApiType): boolean {
    return api === ApiType.WMS;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getMapUrl(params: GetMapParams, api: ApiType): string {
    throw new Error('getMapUrl() not implemented yet');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setEvalscript(evalscript: string): void {
    throw new Error('Evalscript is only supported on Sentinel Hub layers');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setEvalscriptUrl(evalscriptUrl: string): void {
    throw new Error('EvalscriptUrl is only supported on Sentinel Hub layers');
  }

  public async findTiles(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset: number | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    throw new Error('findTiles() not implemented yet');
  }

  public async findFlyovers(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxFindTilesRequests: number = 50,
    tilesPerRequest: number = 50,
    reqConfig?: RequestConfiguration,
  ): Promise<FlyoverInterval[]> {
    if (!this.dataset || !this.dataset.orbitTimeMinutes) {
      throw new Error('Orbit time is needed for grouping tiles into flyovers.');
    }
    if (bbox.crs !== CRS_EPSG4326) {
      throw new Error('Currently, only EPSG:4326 in findFlyovers');
    }

    const orbitTimeS = this.dataset.orbitTimeMinutes * 60;
    const bboxGeometry: Geom = this.roundCoordinates([
      [
        [bbox.minX, bbox.minY],
        [bbox.maxX, bbox.minY],
        [bbox.maxX, bbox.maxY],
        [bbox.minX, bbox.maxY],
        [bbox.minX, bbox.minY],
      ],
    ]);
    const bboxArea = area({
      type: 'Polygon',
      coordinates: bboxGeometry,
    });

    let flyovers: FlyoverInterval[] = [];
    let flyoverIndex = 0;
    let currentFlyoverGeometry: Geom = null;
    let nTilesInFlyover;
    let sumCloudCoverPercent;
    for (let i = 0; i < maxFindTilesRequests; i++) {
      // grab new batch of tiles:
      const { tiles, hasMore } = await this.findTiles(
        bbox,
        fromTime,
        toTime,
        tilesPerRequest,
        i * tilesPerRequest,
        reqConfig,
      );

      // apply each tile to the flyover to calculate coverage:
      for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
        // first tile ever? just add its info and continue:
        if (flyovers.length === 0) {
          flyovers[flyoverIndex] = {
            fromTime: tiles[tileIndex].sensingTime,
            toTime: tiles[tileIndex].sensingTime,
            coveragePercent: 0,
            meta: {},
          };
          currentFlyoverGeometry = tiles[tileIndex].geometry.coordinates as Geom;
          sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
          nTilesInFlyover = 1;
          continue;
        }

        // append the tile to flyovers:
        const prevDateS = moment.utc(flyovers[flyoverIndex].fromTime).unix();
        const currDateS = moment.utc(tiles[tileIndex].sensingTime).unix();
        const diffS = Math.abs(prevDateS - currDateS);
        if (diffS > orbitTimeS) {
          // finish the old flyover:
          try {
            flyovers[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
              bboxGeometry,
              bboxArea,
              currentFlyoverGeometry,
            );
          } catch (err) {
            // if anything goes wrong, play it safe and set coveragePercent to null:
            flyovers[flyoverIndex].coveragePercent = null;
          }
          if (sumCloudCoverPercent !== undefined) {
            flyovers[flyoverIndex].meta.averageCloudCoverPercent = sumCloudCoverPercent / nTilesInFlyover;
          }

          // and start a new one:
          flyoverIndex++;
          flyovers[flyoverIndex] = {
            fromTime: tiles[tileIndex].sensingTime,
            toTime: tiles[tileIndex].sensingTime,
            coveragePercent: 0,
            meta: {},
          };
          currentFlyoverGeometry = tiles[tileIndex].geometry.coordinates as Geom;
          sumCloudCoverPercent = tiles[tileIndex].meta.cloudCoverPercent;
          nTilesInFlyover = 1;
        } else {
          // the same flyover:
          flyovers[flyoverIndex].fromTime = tiles[tileIndex].sensingTime;
          currentFlyoverGeometry = union(
            this.roundCoordinates(currentFlyoverGeometry),
            this.roundCoordinates(tiles[tileIndex].geometry.coordinates as Geom),
          );
          sumCloudCoverPercent =
            sumCloudCoverPercent !== undefined
              ? sumCloudCoverPercent + tiles[tileIndex].meta.cloudCoverPercent
              : undefined;
          nTilesInFlyover++;
        }
      }

      // make sure we exit when there are no more tiles:
      if (!hasMore) {
        break;
      }
      if (i + 1 === maxFindTilesRequests) {
        throw new Error(
          `Could not fetch all the tiles in [${maxFindTilesRequests}] requests for [${tilesPerRequest}] tiles`,
        );
      }
    }

    // if needed, finish the last flyover:
    if (flyovers.length > 0) {
      try {
        flyovers[flyoverIndex].coveragePercent = this.calculateCoveragePercent(
          bboxGeometry,
          bboxArea,
          currentFlyoverGeometry,
        );
      } catch (err) {
        // if anything goes wrong, play it safe and set coveragePercent to null:
        flyovers[flyoverIndex].coveragePercent = null;
      }
      if (sumCloudCoverPercent !== undefined) {
        flyovers[flyoverIndex].meta.averageCloudCoverPercent = sumCloudCoverPercent / nTilesInFlyover;
      }
    }

    return flyovers;
  }

  private calculateCoveragePercent(bboxGeometry: Geom, bboxArea: number, flyoverGeometry: Geom): number {
    let bboxedFlyoverGeometry;
    try {
      bboxedFlyoverGeometry = intersection(
        this.roundCoordinates(bboxGeometry),
        this.roundCoordinates(flyoverGeometry),
      );
    } catch (ex) {
      console.error({ msg: 'intersection() failed', ex, bboxGeometry, flyoverGeometry });
      throw ex;
    }
    try {
      const coveredArea = area({
        type: 'MultiPolygon',
        coordinates: bboxedFlyoverGeometry,
      });
      return (coveredArea / bboxArea) * 100;
    } catch (ex) {
      console.error({ msg: 'Turf.js area() division failed', ex, bboxedFlyoverGeometry, flyoverGeometry });
      throw ex;
    }
  }

  // Because of the bug in polygon-clipping, we need to round coordinates or union() will fail:
  // https://github.com/mfogel/polygon-clipping/issues/93
  private roundCoordinates(geometry: any): any {
    if (typeof geometry === 'number') {
      const shift = 1000000;
      return Math.round(geometry * shift) / shift;
    }
    return geometry.map((x: any) => this.roundCoordinates(x));
  }

  public async findDatesUTC(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Date[]> {
    throw new Error('findDatesUTC() not implemented yet');
  }

  /**
   * @deprecated Please use findDatesUTC() instead.
   */
  public async findDates(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    console.warn('Method findDates() is deprecated and will be removed, please use findDatesUTC() instead');
    return await this.findDatesUTC(bbox, fromTime, toTime);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getStats(payload: any, reqConfig?: RequestConfiguration): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {}
}
