import { DATASET_AWS_LOTL1 } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';
import { Link, LinkType } from './const';

export class Landsat8AWSLOTL1Layer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_LOTL1;

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
