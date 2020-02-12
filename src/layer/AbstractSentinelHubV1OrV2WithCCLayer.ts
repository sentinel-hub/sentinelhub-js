import { GetMapParams, ApiType } from 'src/layer/const';
import { AbstractSentinelHubV1OrV2Layer } from 'src/layer/AbstractSentinelHubV1OrV2Layer';
import { AbstractLayer } from './AbstractLayer';

// same as AbstractSentinelHubV1OrV2Layer, but with maxCloudCoverPercent (useful for Landsat datasets)
export class AbstractSentinelHubV1OrV2WithCCLayer extends AbstractSentinelHubV1OrV2Layer {
  protected maxCloudCoverPercent: number;

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

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    const getMapParams: GetMapParams = {
      maxCloudCoverPercent: this.maxCloudCoverPercent,
      ...params,
    };
    return super.getMapUrl(getMapParams, api);
  }

  protected getFindTilesAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent / 100,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      cloudCoverPercent: tile.cloudCoverPercent,
    };
  }

  // This helper method is called by LayersFactory.makeLayers(). It constructs
  // a layer based on layerInfo and other parameters. Subclasses can override it
  // to use different constructor parameters based on layerInfo.
  //
  // A bit of TypeScript magic: since we want to construct a child class from the static
  // method, we use the method outlined here: https://stackoverflow.com/a/51749145/593487
  public static makeLayer<ChildLayer extends typeof AbstractSentinelHubV1OrV2WithCCLayer>(
    this: ChildLayer,
    layerInfo: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    instanceId: string,
    layerId: string,
    evalscript: string | null,
    evalscriptUrl: string | null,
    title: string | null,
    description: string | null,
  ): AbstractLayer {
    return new this(instanceId, layerId, evalscript, evalscriptUrl, title, description, layerInfo.settings.maxCC);
  }
}
