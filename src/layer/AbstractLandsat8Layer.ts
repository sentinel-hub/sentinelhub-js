import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link, LinkType } from './const';

export class AbstractLandsat8Layer extends AbstractSentinelHubV3WithCCLayer {
  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
      {
        target: `${tile.dataUri}_thumb_small.jpg`,
        type: LinkType.PREVIEW,
      },
    ];
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      sunElevation: tile.sunElevation,
    };
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    return {
      ...super.extractFindTilesMetaFromCatalog(feature),
      sunElevation: feature.properties['view:sun_elevation'],
    };
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (assets.data && assets.data.href) {
      result.push({
        target: assets.data.href.replace('/index.html', `/${feature.id}_thumb_small.jpg`),
        type: LinkType.PREVIEW,
      });
    }
    return result;
  }
}
