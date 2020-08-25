import moment from 'moment';

import { BBox } from '../bbox';

import { PaginatedTiles, MosaickingOrder, DataProductId } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
  mosaickingOrder?: MosaickingOrder | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  maxCloudCoverPercent?: number | null;
}

// same as AbstractSentinelHubV3Layer, but with maxCloudCoverPercent (for layers which support it)
export class AbstractSentinelHubV3WithCCLayer extends AbstractSentinelHubV3Layer {
  public maxCloudCoverPercent: number;

  public constructor({ maxCloudCoverPercent = 100, ...rest }: ConstructorParameters) {
    super(rest);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      ...super.getWmsGetMapUrlAdditionalParameters(),
      maxcc: this.maxCloudCoverPercent,
    };
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload = await super.updateProcessingGetMapPayload(payload);
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: this.extractFindTilesMeta(tile),
        links: this.getTileLinks(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected async fetchTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTilesFromSearchIndexOrCatalog(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      reqConfig,
      this.maxCloudCoverPercent,
    );
    return response;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    return {
      maxCloudCoverage: this.maxCloudCoverPercent / 100,
    };
  }
  protected getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      cloudCoverPercent: tile.cloudCoverPercentage,
    };
  }
}
