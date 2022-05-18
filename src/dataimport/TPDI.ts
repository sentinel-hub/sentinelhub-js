import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import {
  Quota,
  TPDICollections,
  TPDProvider,
  TPDISearchParams,
  TPDI_SERVICE_URL,
  Order,
  TPDSearchResult,
  OrderSearchParams,
  OrderSearchResult,
  TPDIOrderParams,
  TPDIOrderCompatibleCollection,
} from './const';
import { AirbusDataProvider } from './AirbusDataProvider';
import { PlanetDataProvider } from './PlanetDataProvider';
import { MaxarDataProvider } from './MaxarDataProvider';
import { TPDProviderInterface } from './TPDProvider';
import { ensureTimeout } from '../utils/ensureTimeout';
import { getAuthToken } from '../auth';
import axios, { AxiosRequestConfig } from 'axios';
import { CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';

const dataProviders = [new AirbusDataProvider(), new PlanetDataProvider(), new MaxarDataProvider()];

function getThirdPartyDataProvider(provider: TPDProvider): TPDProviderInterface {
  const tpdp = dataProviders.find(p => p.getProvider() === provider);
  if (!tpdp) {
    throw new Error(`Unknown data provider ${provider}`);
  }
  return tpdp;
}

async function getQuotasInner(
  TDPICollectionId?: TPDICollections,
  reqConfig?: RequestConfiguration,
): Promise<Quota[]> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    if (!!TDPICollectionId) {
      requestConfig.params = { collectionId: TDPICollectionId };
    }
    const res = await axios.get(`${TPDI_SERVICE_URL}/quotas`, requestConfig);
    return res.data.data as Quota[];
  }, reqConfig);
}

function createRequestConfig(innerReqConfig: RequestConfiguration): AxiosRequestConfig {
  const authToken = innerReqConfig && innerReqConfig.authToken ? innerReqConfig.authToken : getAuthToken();
  if (!authToken) {
    throw new Error('Must be authenticated to perform request');
  }
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  const requestConfig: AxiosRequestConfig = {
    responseType: 'json',
    headers: headers,
    ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE),
  };
  return requestConfig;
}

export class TPDI {
  public static async getQuota(
    TDPICollectionId: TPDICollections,
    reqConfig?: RequestConfiguration,
  ): Promise<Quota> {
    if (!TDPICollectionId) {
      throw new Error('TDPICollectionId must be provided');
    }
    const quotas = await getQuotasInner(TDPICollectionId, reqConfig);
    return quotas.length ? quotas[0] : null;
  }

  public static async getQuotas(reqConfig?: RequestConfiguration): Promise<Quota[]> {
    return await getQuotasInner(null, reqConfig);
  }

  public static async search(
    provider: TPDProvider,
    params: TPDISearchParams,
    reqConfig?: RequestConfiguration,
    count: number = 10,
    viewtoken: string = null,
  ): Promise<TPDSearchResult> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const tpdp = getThirdPartyDataProvider(provider);
      tpdp.addSearchPagination(requestConfig, count, viewtoken);
      const payload = tpdp.getSearchPayload(params);
      const response = await axios.post<TPDSearchResult>(
        `${TPDI_SERVICE_URL}/search`,
        payload,
        requestConfig,
      );
      return response.data;
    }, reqConfig);
  }

  public static async getThumbnail(
    collectionId: TPDICollections,
    productId: string,
    reqConfig?: RequestConfiguration,
  ): Promise<Blob> {
    if (!collectionId) {
      throw new Error('collectionId must be provided');
    }

    if (!productId) {
      throw new Error('productId must be provided');
    }

    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      requestConfig.responseType = 'blob';

      const response = await axios.get<Blob>(
        `${TPDI_SERVICE_URL}/collections/${collectionId}/products/${productId}/thumbnail`,
        requestConfig,
      );
      const thumbnail = response.data;
      return thumbnail;
    }, reqConfig);
  }

  public static async createOrder(
    provider: TPDProvider,
    name: string,
    collectionId: string,
    items: string[],
    searchParams: TPDISearchParams,
    orderParams?: TPDIOrderParams,
    reqConfig?: RequestConfiguration,
  ): Promise<Order> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const tpdp = getThirdPartyDataProvider(provider);
      const payload = tpdp.getOrderPayload(name, collectionId, items, searchParams, orderParams);
      const response = await axios.post<Order>(`${TPDI_SERVICE_URL}/orders`, payload, requestConfig);
      const order: Order = response.data;
      return order;
    }, reqConfig);
  }

  public static async getOrders(
    params?: OrderSearchParams,
    reqConfig?: RequestConfiguration,
    count?: number,
    viewtoken?: string,
  ): Promise<OrderSearchResult> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);

      let queryParams: Record<string, any> = {};
      if (params) {
        queryParams = { ...params };
      }
      if (!isNaN(count) && count !== null) {
        //set page size
        queryParams.count = count;
      }

      //set offset
      if (viewtoken) {
        queryParams.viewtoken = viewtoken;
      }
      requestConfig.params = queryParams;
      const { data } = await axios.get<OrderSearchResult>(`${TPDI_SERVICE_URL}/orders`, requestConfig);
      return data;
    }, reqConfig);
  }

  public static async getOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<Order> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const response = await axios.get<Order>(`${TPDI_SERVICE_URL}/orders/${orderId}`, requestConfig);
      const order: Order = response.data;
      return order;
    }, reqConfig);
  }

  public static async deleteOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<void> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      await axios.delete(`${TPDI_SERVICE_URL}/orders/${orderId}`, requestConfig);
    }, reqConfig);
  }

  public static async confirmOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<Order> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const response = await axios.post<Order>(
        `${TPDI_SERVICE_URL}/orders/${orderId}/confirm`,
        {},
        requestConfig,
      );
      const order: Order = response.data;
      return order;
    }, reqConfig);
  }

  public static async getCompatibleCollections(
    provider: TPDProvider,
    params: TPDISearchParams,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDIOrderCompatibleCollection[]> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const tpdp = getThirdPartyDataProvider(provider);

      const searchPayload = tpdp.getSearchPayload(params);

      const payload = { input: searchPayload };
      let compatibleCollections: TPDIOrderCompatibleCollection[];

      const { data } = await axios.post(
        `${TPDI_SERVICE_URL}/orders/searchcompatiblecollections/`,
        payload,
        requestConfig,
      );
      if (data?.data) {
        compatibleCollections = data.data.map((c: Record<string, any>) => ({ id: c.id, name: c.name }));
      }

      return compatibleCollections;
    }, reqConfig);
  }
}
