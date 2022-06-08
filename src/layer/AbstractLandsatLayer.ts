import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link, LinkType } from './const';

export class AbstractLandsatLayer extends AbstractSentinelHubV3WithCCLayer {
  protected landsatPreviewUrl = 'https://landsatlook.usgs.gov/gen-browse?size=thumb&type=refl';

  protected getPreviewUrl(productId: string): string | null {
    return `${this.landsatPreviewUrl}&product_id=${productId}`;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    const links: Link[] = [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
    ];

    const previewUrl = this.getPreviewUrl(tile.originalId);

    if (previewUrl) {
      links.push({
        target: this.getPreviewUrl(tile.originalId),
        type: LinkType.PREVIEW,
      });
    }

    return links;
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = [];

    if (assets && assets.data) {
      result.push({ target: assets.data.href, type: LinkType.AWS });
    }

    const previewUrl = this.getPreviewUrl(feature.id);
    if (previewUrl) {
      result.push({
        target: previewUrl,
        type: LinkType.PREVIEW,
      });
    }

    return result;
  }
}
