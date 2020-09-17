import { DATASET_AWS_L8L1C } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link, LinkType } from './const';

export class Landsat8AWSLayer extends AbstractSentinelHubV3WithCCLayer {
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
}
