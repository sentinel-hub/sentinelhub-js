import { AxiosRequestConfig } from 'axios';
import { TPDProvider, TPDISearchParams, TPDIOrderParams } from './const';

export interface TPDProviderInterface {
  getSearchPayload(params: TPDISearchParams): any;
  getOrderPayload(
    name: string,
    collectionId: string,
    items: string[],
    searchParams: TPDISearchParams,
    orderParams: TPDIOrderParams,
  ): any;
  addSearchPagination(requestConfig: AxiosRequestConfig, count: number, viewtoken: string): void;
}

export abstract class AbstractTPDProvider implements TPDProviderInterface {
  protected provider: TPDProvider;

  public getProvider(): TPDProvider {
    return this.provider;
  }

  public addSearchPagination(requestConfig: AxiosRequestConfig, count: number, viewtoken: string): void {
    let queryParams: Record<string, any> = {};
    //set page size
    if (!isNaN(count)) {
      queryParams.count = count;
    }

    //set offset
    if (viewtoken) {
      queryParams.viewtoken = viewtoken;
    }
    requestConfig.params = queryParams;
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

  protected getAdditionalOrderParams(
    items: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    searchParams: TPDISearchParams, // eslint-disable-line @typescript-eslint/no-unused-vars
    orderParams: TPDIOrderParams, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): any {
    return {};
  }

  public getOrderPayload(
    name: string,
    collectionId: string,
    items: string[],
    searchParams: TPDISearchParams,
    orderParams: TPDIOrderParams | null = null,
  ): any {
    const payload: any = {};

    if (!!name) {
      payload.name = name;
    }

    if (!!collectionId) {
      payload.collectionId = collectionId;
    }
    payload.input = this.getAdditionalOrderParams(items, searchParams, orderParams);

    return payload;
  }
}
