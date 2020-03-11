import { GetMapParams, ApiType } from 'src/layer/const';
import { wmsGetMapUrl } from 'src/layer/wms';
import { AbstractLayer } from 'src/layer/AbstractLayer';

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
}

export class WmsLayer extends AbstractLayer {
  // The URL of the WMS service, for example: "https://services.sentinel-hub.com/ogc/wms/<instance-id>/"
  protected baseUrl: string;
  protected layerId: string;

  public constructor(
    baseUrl: string,
    layerId: string,
    title: string | null = null,
    description: string | null = null,
  ) {
    super({ title, description });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
  }

  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('Only WMS is supported on this layer');
    }
    return wmsGetMapUrl(this.baseUrl, this.layerId, params);
  }
}
