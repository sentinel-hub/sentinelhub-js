import { DATASET_EOCLOUD_LANDSAT5 } from 'src/layer/dataset';
import { AbstractSentinelHubV1OrV2WithCCLayer } from 'src/layer/AbstractSentinelHubV1OrV2WithCCLayer';
import { Link } from 'src/layer/const';

export class Landsat5EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
  public readonly dataset = DATASET_EOCLOUD_LANDSAT5;

  public static makeLayer(
    layerInfo: any,
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): Landsat5EOCloudLayer {
    const maxCloudCoverPercent = layerInfo.settings.maxCC;
    return new Landsat5EOCloudLayer({
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
        href: tile.pathFragment,
        rel: 'self',
        title: 'EOCloudPath',
      },
      {
        href: `${tile.previewUrl.replace('eocloud', 'creodias')}.JPG`,
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
