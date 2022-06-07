import { DATASET_AWS_LETML2 } from './dataset';
import { AbstractLandsatLayer } from './AbstractLandsatLayer';
import { Link, LinkType } from './const';

export class Landsat7AWSLETML2Layer extends AbstractLandsatLayer {
  public readonly dataset = DATASET_AWS_LETML2;

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.dataUri,
        type: LinkType.AWS,
      },
    ];
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = [];

    if (assets && assets.data) {
      result.push({ target: assets.data.href, type: LinkType.AWS });
    }

    return result;
  }
}
