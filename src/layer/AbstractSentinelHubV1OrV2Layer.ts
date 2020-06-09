import axios from 'axios';
import moment from 'moment';
import { stringify } from 'query-string';
import WKT from 'terraformer-wkt-parser';

import { BBox } from 'src/bbox';
import {
  GetMapParams,
  ApiType,
  PaginatedTiles,
  GetStatsParams,
  Stats,
  HistogramType,
  FisPayload,
  MosaickingOrder,
  Interpolator,
  Link,
  DEFAULT_FIND_TILES_MAX_COUNT_PARAMETER,
} from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { AbstractLayer } from 'src/layer/AbstractLayer';
import { CRS_EPSG4326, findCrsFromUrn } from 'src/crs';
import { fetchGetCapabilitiesXml } from 'src/layer/utils';
import { getAxiosReqParams, RequestConfiguration } from 'src/utils/cancelRequests';
import { ensureTimeout } from 'src/utils/ensureTimeout';

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

  protected getEvalsource(): string {
    // some subclasses (Sentinel 1 at EO Cloud) might want to return a different
    // evalsource depending on their parameters
    return this.dataset.shWmsEvalsource;
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

  public async findTiles(
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
    const tiles = await ensureTimeout(async innerReqConfig => {
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
        ...getAxiosReqParams(innerReqConfig),
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
    }, reqConfig);
    return tiles;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    return {};
  }

  protected getStatsAdditionalParameters(): Record<string, any> {
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
    if (!this.dataset.findDatesUTCUrl) {
      throw new Error('This dataset does not support searching for dates');
    }
    const datesUTC = await ensureTimeout(async innerReqConfig => {
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
        ...getAxiosReqParams(innerReqConfig),
      });

      return response.data.map((date: string) => moment.utc(date).toDate());
    }, reqConfig);
    return datesUTC;
  }

  public async getStats(params: GetStatsParams, reqConfig?: RequestConfiguration): Promise<Stats> {
    if (!params.geometry) {
      throw new Error('Parameter "geometry" needs to be provided');
    }
    if (!params.resolution) {
      throw new Error('Parameter "resolution" needs to be provided');
    }
    if (!params.fromTime || !params.toTime) {
      throw new Error('Parameters "fromTime" and "toTime" need to be provided');
    }

    const stats = await ensureTimeout(async innerParams => {
      const payload: FisPayload = {
        layer: this.layerId,
        crs: CRS_EPSG4326.authId,
        geometry: WKT.convert(params.geometry),
        time: `${moment.utc(params.fromTime).format('YYYY-MM-DDTHH:mm:ss') + 'Z'}/${moment
          .utc(params.toTime)
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z'}`,
        resolution: undefined,
        bins: params.bins || 5,
        type: HistogramType.EQUALFREQUENCY,
        ...this.getStatsAdditionalParameters(),
      };

      if (params.geometry.crs) {
        const selectedCrs = findCrsFromUrn(params.geometry.crs.properties.name);
        payload.crs = selectedCrs.authId;
      }
      // When using CRS=EPSG:4326 one has to add the "m" suffix to enforce resolution in meters per pixel
      if (payload.crs === CRS_EPSG4326.authId) {
        payload.resolution = params.resolution + 'm';
      } else {
        payload.resolution = params.resolution;
      }
      if (this.evalscript) {
        if (typeof window !== 'undefined' && window.btoa) {
          payload.evalscript = btoa(this.evalscript);
        } else {
          payload.evalscript = Buffer.from(this.evalscript, 'utf8').toString('base64');
        }
        payload.evalsource = this.getEvalsource();
      }

      const { data } = await axios.get(this.dataset.shServiceHostname + 'v1/fis/' + this.instanceId, {
        params: payload,
        ...getAxiosReqParams(innerParams),
      });
      // convert date strings to Date objects
      for (let channel in data) {
        data[channel] = data[channel].map((dailyStats: any) => ({
          ...dailyStats,
          date: new Date(dailyStats.date),
        }));
      }
      return data;
    }, reqConfig);
    return stats;
  }

  public async updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void> {
    if (this.instanceId === null || this.layerId === null) {
      throw new Error(
        "Additional data can't be fetched from service because instanceId and layerId are not defined",
      );
    }

    const legendUrl = await ensureTimeout(async innerReqConfig => {
      const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
      const capabilities = await fetchGetCapabilitiesXml(baseUrl, innerReqConfig);
      const layer = capabilities.WMS_Capabilities.Capability[0].Layer[0].Layer.find(
        layerInfo => this.layerId === layerInfo.Name[0],
      );
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
