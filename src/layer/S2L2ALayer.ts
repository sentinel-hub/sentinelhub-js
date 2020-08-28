import { DATASET_S2L2A } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from './processing';
import { Link, LinkType } from './const';

export class S2L2ALayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L2A;

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
      {
        // S-2 L2A doesn't have previews, but we can use corresponding L1C ones instead:
        target: `https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles${
          tile.dataUri.split('tiles')[1]
        }/preview.jpg`,
        type: LinkType.PREVIEW,
      },
    ];
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      tileId: tile.id,
      MGRSLocation: tile.dataUri
        .split('/')
        .slice(4, 7)
        .join(''),
    };
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    let result: Record<string, any> = {};

    result = {
      ...super.extractFindTilesMetaFromCatalog(feature),
    };

    if (feature.assets && feature.assets.data) {
      result.MGRSLocation = feature.assets.data.href
        .split('/')
        .slice(4, 7)
        .join('');
    }
    return result;
  }
}
