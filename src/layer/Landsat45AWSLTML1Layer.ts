import { DATASET_AWS_LTML1 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link, LinkType } from './const';

export class Landsat45AWSLTML1Layer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_LTML1;

  private getPreviewUrl(productId: string): string {
    return `https://landsatlook.usgs.gov/gen-browse?size=thumb&type=refl&product_id=${productId}`;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
      {
        target: this.getPreviewUrl(tile.originalId),
        type: LinkType.PREVIEW,
      },
    ];
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = [];

    if (assets && assets.data) {
      result.push({ target: assets.data.href, type: LinkType.AWS });
    }
    result.push({
      target: this.getPreviewUrl(feature.id),
      type: LinkType.PREVIEW,
    });
    return result;
  }
}
