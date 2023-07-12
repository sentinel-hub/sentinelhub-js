import { WmsLayer } from './WmsLayer';
import { ApiType, GetMapParams } from './const';
import { wmsWmtMsGetMapUrl } from './wms';

export class WmsWmtMsLayer extends WmsLayer {
  public getMapUrl(params: GetMapParams, api: ApiType): string {
    if (api !== ApiType.WMS) {
      throw new Error('Only WMS is supported on this layer');
    }
    if (params.gain) {
      throw new Error('Parameter gain is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.gamma) {
      throw new Error('Parameter gamma is not supported in getMapUrl. Use getMap method instead.');
    }
    if (params.effects) {
      throw new Error('Parameter effects is not supported in getMapUrl. Use getMap method instead.');
    }
    return wmsWmtMsGetMapUrl(this.baseUrl, this.layerId, params);
  }
}
