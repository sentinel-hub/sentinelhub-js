import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles, Link } from 'src/layer/const';
import { DATASET_S3OLCI } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';

export class S3OLCILayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_S3OLCI;

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    const response = await this.fetchTiles(
      this.dataset.searchIndexUrl,
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
    );
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

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        href: tile.originalId.replace('EODATA', '/eodata'),
        rel: 'self',
        title: 'creoDIASPath',
      },
      {
        href: `https://finder.creodias.eu/files${tile.originalId.replace(
          'EODATA',
          '',
        )}/${tile.productName.replace('.SEN3', '')}-ql.jpg`,
        rel: 'self',
        title: 'Preview',
      },
    ];
  }
}
