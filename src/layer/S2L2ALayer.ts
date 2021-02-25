import { DATASET_S2L2A } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from './processing';
import { Link, LinkType } from './const';

export class S2L2ALayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L2A;

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload.input.data[datasetSeqNo].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
  }

  private createPreviewLinkFromDataUri(dataUri: string): Link {
    return {
      // S-2 L2A doesn't have previews, but we can use corresponding L1C ones instead:
      target: `https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles${dataUri}preview.jpg`,
      type: LinkType.PREVIEW,
    };
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
      this.createPreviewLinkFromDataUri(`${tile.dataUri.split('tiles')[1]}/`),
    ];
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (feature && feature.assets && feature.assets.data) {
      const dataUri = feature.assets.data.href.split('tiles')[1];
      result.push(this.createPreviewLinkFromDataUri(dataUri));
    }

    return result;
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
    let result: Record<string, any> = super.extractFindTilesMetaFromCatalog(feature);

    if (feature.assets && feature.assets.data && feature.assets.data.href) {
      result.MGRSLocation = feature.assets.data.href
        .split('/')
        .slice(4, 7)
        .join('');
    }
    return result;
  }
}
