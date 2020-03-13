import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  title?: string | null;
  description?: string | null;
  maxCloudCoverPercent?: number | null;
}

// same as AbstractSentinelHubV1OrV2Layer, but with maxCloudCoverPercent (useful for Landsat datasets)
export class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
  public maxCloudCoverPercent: number;

  public constructor({
    instanceId = null,
    layerId = null,
    evalscript = null,
    evalscriptUrl = null,
    title = null,
    description = null,
    maxCloudCoverPercent = 100,
  }: ConstructorParameters) {
    super({ instanceId, layerId, evalscript, evalscriptUrl, title, description });
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

  protected getFindDatesAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent / 100,
    };
  }
}
