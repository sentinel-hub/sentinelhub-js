import axios, { AxiosRequestConfig } from 'axios';
import { getAuthToken } from '../auth';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { TPDProvider, TPDISearchParams, TPDI_SERVICE_URL } from './const';

export interface TPDProviderInterface {
  search(params: TPDISearchParams, reqConfig?: RequestConfiguration): Promise<void>;
  getProvider(): TPDProvider;
}

export abstract class AbstractTPDProvider implements TPDProviderInterface {
  protected provider: TPDProvider;
  protected serviceUrl = `${TPDI_SERVICE_URL}/search`;

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

  public async search(params: TPDISearchParams, reqConfig?: RequestConfiguration): Promise<any> {
    return await ensureTimeout(async innerReqConfig => this._search(params, innerReqConfig), reqConfig);
  }

  protected getSearchPayload(params: TPDISearchParams): any {
    const commonParams = this.getCommonSearchParams(params);
    const additionalParams = this.getAdditionalSearchParams(params);
    const payload = { ...commonParams, ...additionalParams };
    return payload;
  }

  protected async _search(params: TPDISearchParams, reqConfig?: RequestConfiguration): Promise<any> {
    const authToken = reqConfig && reqConfig.authToken ? reqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to search for data');
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
    const requestConfig: AxiosRequestConfig = {
      headers: headers,
      ...getAxiosReqParams(reqConfig, null),
    };

    const payload = this.getSearchPayload(params);
    return await axios.post(this.serviceUrl, payload, requestConfig);
  }
}
