import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';

// same as AbstractSentinelHubV1OrV2Layer, but with maxCloudCoverPercent (useful for Landsat datasets)
export class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
  public maxCloudCoverPercent: number;

  public constructor(
    instanceId: string,
    layerId: string,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    title: string | null = null,
    description: string | null = null,
    maxCloudCoverPercent: number | null = 100,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, title, description);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }

  protected getFindTilesAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent / 100,
    };
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      cloudCoverPercent: tile.cloudCoverPercentage,
    };
  }
}
