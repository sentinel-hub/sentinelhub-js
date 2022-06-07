import { DATASET_AWS_L8L1C } from './dataset';
import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';
import { Link, LinkType } from './const';

export class Landsat8AWSLayer extends AbstractLandsat8Layer {
  public readonly dataset = DATASET_AWS_L8L1C;

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

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = [];

    if (assets && assets.data) {
      result.push({ target: assets.data.href, type: LinkType.AWS });
    }

    if (assets.data && assets.data.href) {
      result.push({
        target: assets.data.href.replace('/index.html', `/${feature.id}_thumb_small.jpg`),
        type: LinkType.PREVIEW,
      });
    }
    return result;
  }
}
