import { MosaickingOrder } from 'src/layer/const';
import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  title?: string | null;
  description?: string | null;
  maxCloudCoverPercent?: number | null;
  mosaickingOrder?: MosaickingOrder | null;
}

// same as AbstractSentinelHubV1OrV2Layer, but with maxCloudCoverPercent (useful for Landsat datasets)
export class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
  public maxCloudCoverPercent: number;

  public constructor({ maxCloudCoverPercent = 100, ...rest }: ConstructorParameters) {
    super(rest);
    this.maxCloudCoverPercent = maxCloudCoverPercent;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      ...super.getWmsGetMapUrlAdditionalParameters(),
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

  protected async getFindDatesUTCAdditionalParameters(): Promise<Record<string, any>> {
    return {
      maxcc: this.maxCloudCoverPercent / 100,
    };
  }

  protected getStatsAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }
}
