import moment from 'moment';

import { BBox } from '../bbox';
import { PaginatedTiles, Link, LinkType } from './const';
import { DATASET_S3OLCI } from './dataset';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';

export class S3OLCILayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S3OLCI;

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map(tile => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: {},
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
    const response = await this.fetchTilesSearchIndex(
      this.dataset.searchIndexUrl,
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      reqConfig,
    );
    return response;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.originalId.replace('EODATA', '/eodata'),
        type: LinkType.CREODIAS,
      },
      {
        target: `https://finder.creodias.eu/files${tile.originalId.replace(
          'EODATA',
          '',
        )}/${tile.productName.replace('.SEN3', '')}-ql.jpg`,
        type: LinkType.PREVIEW,
      },
    ];
  }
}
