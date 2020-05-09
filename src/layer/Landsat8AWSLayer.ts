import { DATASET_AWS_L8L1C } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link } from 'src/layer/const';

export class Landsat8AWSLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_AWS_L8L1C;

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        href: tile.dataUri,
        rel: 'self',
        title: 'AWSPath',
      },
      {
        href: `${tile.dataUri}_thumb_small.jpg`,
        rel: 'self',
        title: 'Preview',
      },
    ];
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      cloudCoverPercent: tile.cloudCoverPercentage,
      sunElevation: tile.sunElevation,
    };
  }
}
