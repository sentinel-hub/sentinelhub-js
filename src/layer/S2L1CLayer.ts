import { DATASET_S2L1C } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link } from 'src/layer/const';

export class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L1C;

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        href: tile.dataUri,
        rel: 'self',
        title: 'AWSPath',
      },
      {
        href: `https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles${
          tile.dataUri.split('tiles')[1]
        }/preview.jpg`,
        rel: 'self',
        title: 'Preview',
      },
    ];
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      cloudCoverPercent: tile.cloudCoverPercentage,
      tileId: tile.id,
      MGRSLocation: tile.dataUri
        .split('/')
        .slice(4, 7)
        .join(''),
    };
  }
}
