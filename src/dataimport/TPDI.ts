import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import {
  Quota,
  TPDICollections,
  TPDProvider,
  TPDISearchParams,
  TPDITransaction,
  TPDSearchResult,
  TPDITransactionSearchParams,
  TPDITransactionSearchResult,
  TPDITransactionParams,
  TPDITransactionCompatibleCollection,
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

export let TPDI_SERVICE_URL = 'https://services.sentinel-hub.com/api/v1/dataimport';

export function setTPDIServiceBaseURL(baseurl: string): void {
  TPDI_SERVICE_URL = `${baseurl}/api/v1/dataimport`;
}

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
    const res = await axios.get(`${TPDI_SERVICE_URL}/accountquotas`, requestConfig);
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

async function getTransactions(
  serviceEndpoint: string,
  params?: TPDITransactionSearchParams,
  reqConfig?: RequestConfiguration,
  count?: number,
  viewtoken?: string,
): Promise<TPDITransactionSearchResult> {
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
    //`${TPDI_SERVICE_URL}/orders`
    const { data } = await axios.get<TPDITransactionSearchResult>(serviceEndpoint, requestConfig);
    return data;
  }, reqConfig);
}

async function getTransaction(
  serviceEndpoint: string,
  id: string,
  reqConfig?: RequestConfiguration,
): Promise<TPDITransaction> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    const { data } = await axios.get<TPDITransaction>(`${serviceEndpoint}/${id}`, requestConfig);
    return data;
  }, reqConfig);
}

async function deleteTransaction(
  serviceEndpoint: string,
  id: string,
  reqConfig?: RequestConfiguration,
): Promise<void> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    await axios.delete(`${serviceEndpoint}/${id}`, requestConfig);
  }, reqConfig);
}

async function confirmTransaction(
  serviceEndpoint: string,
  id: string,
  reqConfig?: RequestConfiguration,
): Promise<TPDITransaction> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    const { data } = await axios.post<TPDITransaction>(`${serviceEndpoint}/${id}/confirm`, {}, requestConfig);
    return data;
  }, reqConfig);
}

async function cancelTransaction(
  serviceEndpoint: string,
  id: string,
  reqConfig?: RequestConfiguration,
): Promise<TPDITransaction> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    const { data } = await axios.post<TPDITransaction>(`${serviceEndpoint}/${id}/cancel`, {}, requestConfig);
    return data;
  }, reqConfig);
}

async function createTransaction(
  serviceEndpoint: string,
  tpdiProvider: TPDProviderInterface,
  name: string,
  collectionId: string,
  items: string[],
  searchParams: TPDISearchParams,
  transactionParams?: TPDITransactionParams,
  reqConfig?: RequestConfiguration,
): Promise<TPDITransaction> {
  return await ensureTimeout(async innerReqConfig => {
    const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
    const payload = tpdiProvider.getTransactionPayload(
      name,
      collectionId,
      items,
      searchParams,
      transactionParams,
    );
    const { data } = await axios.post<TPDITransaction>(serviceEndpoint, payload, requestConfig);
    return data;
  }, reqConfig);
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
    orderParams?: TPDITransactionParams,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    const tpdiProvider = getThirdPartyDataProvider(provider);
    return await createTransaction(
      `${TPDI_SERVICE_URL}/orders`,
      tpdiProvider,
      name,
      collectionId,
      items,
      searchParams,
      orderParams,
      reqConfig,
    );
  }

  public static async createSubscription(
    provider: TPDProvider,
    name: string,
    collectionId: string,
    items: string[],
    searchParams: TPDISearchParams,
    subscriptionParams?: TPDITransactionParams,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    const tpdiProvider = getThirdPartyDataProvider(provider);
    tpdiProvider.checkSubscriptionsSupported();
    return await createTransaction(
      `${TPDI_SERVICE_URL}/subscriptions`,
      tpdiProvider,
      name,
      collectionId,
      items,
      searchParams,
      subscriptionParams,
      reqConfig,
    );
  }

  public static async getOrders(
    params?: TPDITransactionSearchParams,
    reqConfig?: RequestConfiguration,
    count?: number,
    viewtoken?: string,
  ): Promise<TPDITransactionSearchResult> {
    return await getTransactions(`${TPDI_SERVICE_URL}/orders`, params, reqConfig, count, viewtoken);
  }

  public static async getSubscriptions(
    params?: TPDITransactionSearchParams,
    reqConfig?: RequestConfiguration,
    count?: number,
    viewtoken?: string,
  ): Promise<TPDITransactionSearchResult> {
    return await getTransactions(`${TPDI_SERVICE_URL}/subscriptions`, params, reqConfig, count, viewtoken);
  }

  public static async getOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<TPDITransaction> {
    return await getTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
  }

  public static async getSubscription(
    id: string,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    return await getTransaction(`${TPDI_SERVICE_URL}/orders`, id, reqConfig);
  }

  public static async deleteOrder(orderId: string, reqConfig?: RequestConfiguration): Promise<void> {
    return await deleteTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
  }

  public static async deleteSubscription(id: string, reqConfig?: RequestConfiguration): Promise<void> {
    return await deleteTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
  }

  public static async confirmOrder(
    orderId: string,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    return await confirmTransaction(`${TPDI_SERVICE_URL}/orders`, orderId, reqConfig);
  }

  public static async confirmSubscription(
    id: string,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    return await confirmTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
  }

  public static async cancelSubscription(
    id: string,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransaction> {
    return await cancelTransaction(`${TPDI_SERVICE_URL}/subscriptions`, id, reqConfig);
  }

  public static async getCompatibleCollections(
    provider: TPDProvider,
    params: TPDISearchParams,
    reqConfig?: RequestConfiguration,
  ): Promise<TPDITransactionCompatibleCollection[]> {
    return await ensureTimeout(async innerReqConfig => {
      const requestConfig: AxiosRequestConfig = createRequestConfig(innerReqConfig);
      const tpdp = getThirdPartyDataProvider(provider);

      const searchPayload = tpdp.getSearchPayload(params);

      const payload = { input: searchPayload };
      let compatibleCollections: TPDITransactionCompatibleCollection[];

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
