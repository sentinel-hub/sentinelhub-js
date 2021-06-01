import { TPDProvider, TPDISearchParams } from './const';

export interface TPDProviderInterface {
  getSearchPayload(params: TPDISearchParams): any;
}

export abstract class AbstractTPDProvider implements TPDProviderInterface {
  protected provider: TPDProvider;

  public getProvider(): TPDProvider {
    return this.provider;
  }

  protected getCommonSearchParams(params: TPDISearchParams): any {
    const payload: any = {};
    //provider
    payload['provider'] = this.provider;

    //bounds
    //Defines the request bounds by specifying the bounding box and/or geometry for the request.

    if (!params.bbox && !params.geometry) {
      throw new Error('Parameter bbox and/or geometry must be specified');
    }

    const bounds: any = {};

    if (!!params.bbox) {
      bounds.bbox = [params.bbox.minX, params.bbox.minY, params.bbox.maxX, params.bbox.maxY];
      bounds.properties = {
        crs: params.bbox.crs.opengisUrl,
      };
    }

    if (!!params.geometry) {
      if (!params.crs) {
        throw new Error('Parameter crs must be specified');
      }
      bounds.geometry = params.geometry;
      bounds.properties = {
        crs: params.crs.opengisUrl,
      };
    }

    payload.bounds = bounds;

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    return {};
  }

  public getSearchPayload(params: TPDISearchParams): any {
    const commonParams = this.getCommonSearchParams(params);
    const additionalParams = this.getAdditionalSearchParams(params);
    const payload = { ...commonParams, ...additionalParams };
    return payload;
  }
}
