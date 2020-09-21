import { DATASET_S2L1C } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link, LinkType } from './const';

export class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L1C;

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
      {
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
