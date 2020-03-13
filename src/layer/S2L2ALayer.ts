import axios from 'axios';
import moment from 'moment';

import { BBox } from 'src/bbox';
import { CRS_EPSG4326 } from 'src/crs';
import { ProcessingPayload } from 'src/layer/processing';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_S2L2A } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from 'src/layer/AbstractSentinelHubV3WithCCLayer';

export class S2L2ALayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L2A;

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    await this.updateLayerFromServiceIfNeeded();

    if (!this.dataset.searchIndexUrl) {
      throw new Error('This dataset does not support searching for tiles');
    }
    if (bbox.crs !== CRS_EPSG4326) {
      throw new Error('Currently, only EPSG:4326 is supported when using findTiles with this dataset');
    }

    // https://git.sinergise.com/sentinel-core/java/-/wikis/Catalog
    const payload: any = {
      bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
      datetime: `${moment.utc(fromTime).toISOString()}/${moment.utc(toTime).toISOString()}`,
      collections: ['sentinel-2-l2a'],
      limit: maxCount,
      query: {
        'eo:cloud_cover': {
          lte: this.maxCloudCoverPercent,
        },
      },
    };
    if (offset > 0) {
      payload.next = offset;
    }

    const response = await axios.post(this.dataset.searchIndexUrl, payload);
    return {
      tiles: response.data.features.map((feature: Record<string, any>) => ({
        geometry: feature.geometry,
        sensingTime: moment.utc(feature.properties.datetime).toDate(),
        meta: {
          cloudCoverPercent: feature.properties['eo:cloud_cover'],
        },
      })),
      hasMore: response.data['search:metadata'].next ? true : false,
    };
  }
}
