import { DATASET_EOCLOUD_LANDSAT7 } from 'src/layer/dataset';
import { AbstractSentinelHubV1OrV2WithCCLayer } from 'src/layer/AbstractSentinelHubV1OrV2WithCCLayer';
import { Link, LinkType } from 'src/layer/const';

export class Landsat7EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
  public readonly dataset = DATASET_EOCLOUD_LANDSAT7;

  public static makeLayer(
    layerInfo: any,
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): Landsat7EOCloudLayer {
    const maxCloudCoverPercent = layerInfo.settings.maxCC;
    return new Landsat7EOCloudLayer({
      instanceId,
      layerId,
      evalscript,
      evalscriptUrl,
      title,
      description,
      maxCloudCoverPercent,
    });
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.pathFragment,
        type: LinkType.EOCLOUD,
      },
      {
        target: `${tile.previewUrl.replace('eocloud', 'creodias')}.JPG`,
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
}
