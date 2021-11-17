import { AbstractLayer } from './AbstractLayer';

interface ConstructorParameters {
  baseUrl?: string;
  layerId?: string;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
}

export class WmtsLayer extends AbstractLayer {
  // The URL of the WMS service, for example: "https://services.sentinel-hub.com/ogc/wms/<instance-id>/"
  protected baseUrl: string;
  protected layerId: string;

  public constructor({
    baseUrl,
    layerId,
    title = null,
    description = null,
    legendUrl = null,
  }: ConstructorParameters) {
    super({ title, description, legendUrl });
    this.baseUrl = baseUrl;
    this.layerId = layerId;
  }
}
