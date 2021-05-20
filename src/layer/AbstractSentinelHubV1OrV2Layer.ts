import axios from 'axios';
import moment from 'moment';
import { stringify } from 'query-string';

import { BBox } from '../bbox';
import {
  GetMapParams,
  ApiType,
  PaginatedTiles,
  GetStatsParams,
  Stats,
  MosaickingOrder,
  Interpolator,
  Link,
  DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER,
} from './const';
import { wmsGetMapUrl } from './wms';
import { AbstractLayer } from './AbstractLayer';
import { fetchLayersFromGetCapabilitiesXml } from './utils';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';
import { getStatisticsProvider, StatisticsProviderType } from '../statistics/StatisticsProvider';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
  upsampling?: Interpolator | null;
  downsampling?: Interpolator | null;
  legendUrl?: string | null;
}

// this class provides any SHv1- or SHv2-specific (EO Cloud) functionality to the subclasses:
export class AbstractSentinelHubV1OrV2Layer extends AbstractLayer {
  protected instanceId: string;
  protected layerId: string;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;
  protected mosaickingOrder: MosaickingOrder | null;
  protected upsampling: Interpolator | null;
  protected downsampling: Interpolator | null;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    mosaickingOrder = null,
    title = null,
    description = null,
    upsampling = null,
    downsampling = null,
    legendUrl = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    if (!layerId || !instanceId) {
      throw new Error('Parameters instanceId and layerId must be specified!');
    }
    this.instanceId = instanceId;
    this.layerId = layerId;
    this.evalscript = evalscript;
    this.evalscriptUrl = evalscriptUrl;
    this.mosaickingOrder = mosaickingOrder;
    this.upsampling = upsampling;
    this.downsampling = downsampling;
  }

  public getEvalsource(): string {
    // some subclasses (Sentinel 1 at EO Cloud) might want to return a different
    // evalsource depending on their parameters
    return this.dataset.shWmsEvalsource;
  }

  public getLayerId(): string {
    return this.layerId;
  }

  public getEvalscript(): string {
    return this.evalscript;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    let additionalParameters: Record<string, any> = {};
    if (this.mosaickingOrder) {
      additionalParameters.priority = this.mosaickingOrder;
    }
    if (this.upsampling) {
      additionalParameters.upsampling = this.upsampling;
    }
    if (this.downsampling) {
      additionalParameters.downsampling = this.downsampling;
    }
    return additionalParameters;
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('Only WMS is supported on this layer');
    }
    if (params.gain) {
      throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.gamma) {
      throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.effects) {
      throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
    }
    const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
    return wmsGetMapUrl(
      baseUrl,
      this.layerId,
      params,
      this.evalscript,
      this.evalscriptUrl,
      this.getEvalsource(),
      this.getWmsGetMapUrlAdditionalParameters(),
    );
  }

  public setEvalscript(evalscript: string): void {
    this.evalscript = evalscript;
  }

  public setEvalscriptUrl(evalscriptUrl: string): void {
    this.evalscriptUrl = evalscriptUrl;
  }

  protected getFindTilesAdditionalParameters(): Record<string, any> {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {};
  }

  protected async findTilesInner(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    if (!this.dataset.searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    if (maxCount === null) {
      maxCount = DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER;
    }
    if (offset === null) {
      offset = 0;
    }

    const payload = bbox.toGeoJSON();
    const params = {
      expand: 'true',
      timefrom: fromTime.toISOString(),
      timeto: toTime.toISOString(),
      maxcount: maxCount,
      offset: Number(offset),
      ...this.getFindTilesAdditionalParameters(),
    };

    const url = `${this.dataset.searchIndexUrl}?${stringify(params, { sort: false })}`;
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-CRS': 'EPSG:4326',
      },
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE),
    });

    const responseTiles: any[] = response.data.tiles;
    return {
      tiles: responseTiles.map(tile => ({
        geometry: tile.tileDrawRegionGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: this.extractFindTilesMeta(tile),
        links: this.getTileLinks(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    return {};
  }

  public getStatsAdditionalParameters(): Record<string, any> {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [];
  }

  public async findDatesUTC(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    reqConfig?: RequestConfiguration,
  ): Promise<Date[]> {
    const datesUTC = await ensureTimeout(async innerReqConfig => {
      if (!this.dataset.findDatesUTCUrl) {
        throw new Error('This dataset does not support searching for dates');
      }
      const payload = bbox.toGeoJSON();
      const params = {
        timefrom: fromTime.toISOString(),
        timeto: toTime.toISOString(),
        ...(await this.getFindDatesUTCAdditionalParameters(innerReqConfig)),
      };

      const url = `${this.dataset.findDatesUTCUrl}?${stringify(params, { sort: false })}`;
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE),
      });

      return response.data.map((date: string) => moment.utc(date).toDate());
    }, reqConfig);
    return datesUTC;
  }

  public async getStats(
    params: GetStatsParams,
    reqConfig: RequestConfiguration = {},
    statsProvider: StatisticsProviderType = StatisticsProviderType.FIS,
  ): Promise<Stats> {
    const stats = await ensureTimeout(async innerReqConfig => {
      const sp = getStatisticsProvider(statsProvider);
      const data: Stats = await sp.getStats(this, params, innerReqConfig);
      return data;
    }, reqConfig);
    return stats;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    const legendUrl = await ensureTimeout(async innerReqConfig => {
      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "Additional data can't be fetched from service because instanceId and layerId are not defined",
        );
      }

      const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
      const parsedLayers = await fetchLayersFromGetCapabilitiesXml(baseUrl, innerReqConfig);
      const layer = parsedLayers.find(layerInfo => this.layerId === layerInfo.Name[0]);
      if (!layer) {
        throw new Error('Layer not found');
      }
      const legendUrl =
        layer.Style && layer.Style[0].LegendURL
          ? layer.Style[0].LegendURL[0].OnlineResource[0]['$']['xlink:href']
          : null;
      return legendUrl;
    }, reqConfig);
    this.legendUrl = legendUrl;
  }
}
