import axios from 'axios';
import { stringify } from 'query-string';

import { BBox } from 'src/bbox';
import { GetMapParams, ApiType, PaginatedTiles } from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { AbstractLayer } from 'src/layer/AbstractLayer';

// this class provides any SHv1- or SHv2-specific (EO Cloud) functionality to the subclasses:
export class AbstractSentinelHubV1OrV2Layer extends AbstractLayer {
  protected instanceId: string;
  protected layerId: string;
  protected evalscript: string | null;
  protected evalscriptUrl: string | null;

  public constructor(
    instanceId: string,
    layerId: string,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    title: string | null = null,
    description: string | null = null,
  ) {
    super(title, description);
    if (!layerId || !instanceId) {
      throw new Error('Parameters instanceId and layerId must be specified!');
    }
    this.instanceId = instanceId;
    this.layerId = layerId;
    this.evalscript = evalscript;
    this.evalscriptUrl = evalscriptUrl;
  }

  protected getEvalsource(): string {
    // some subclasses (Sentinel 1 at EO Cloud) might want to return a different
    // evalsource depending on their parameters
    return this.dataset.shWmsEvalsource;
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('Only WMS is supported on this layer');
    }
    const baseUrl = `${this.dataset.shServiceHostname}v1/wms/${this.instanceId}`;
    return wmsGetMapUrl(
      baseUrl,
      this.layerId,
      params,
      this.evalscript,
      this.evalscriptUrl,
      this.getEvalsource(),
    );
  }

  protected getFindTilesAdditionalParameters(): Record<string, string> {
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
    maxCount: number = 50,
    offset: number = 0,
  ): Promise<PaginatedTiles> {
    if (!this.dataset.searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    const bboxPolygon = {
      type: 'Polygon',
      crs: { type: 'name', properties: { name: bbox.crs.urn } },
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
    const payload = bboxPolygon;
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
      headers: { 'Content-Type': 'application/json' },
    });

    const responseTiles: any[] = response.data.tiles;
    return {
      tiles: responseTiles.map(tile => ({
        geometry: tile.tileDrawRegionGeometry,
        sensingTime: new Date(tile.sensingTime),
        meta: this.extractFindTilesMeta(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  // This helper method is called by LayersFactory.makeLayers(). It constructs
  // a layer based on layerInfo and other parameters. Subclasses can override it
  // to use different constructor parameters based on layerInfo.
  //
  // A bit of TypeScript magic: since we want to construct a child class from the static
  // method, we use the method outlined here: https://stackoverflow.com/a/51749145/593487
  public static makeLayer<ChildLayer extends typeof AbstractSentinelHubV1OrV2Layer>(
    this: ChildLayer,
    layerInfo: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): AbstractSentinelHubV1OrV2Layer {
    return new this(instanceId, layerId, evalscript, evalscriptUrl, title, description);
  }
}
