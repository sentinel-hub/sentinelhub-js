import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { Quota, TPDICollections, TPDProvider, TPDISearchParams, TPDI_SERVICE_URL } from './const';
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
): Promise<any> {
  return await ensureTimeout(async innerReqConfig => {
    const authToken = innerReqConfig && innerReqConfig.authToken ? innerReqConfig.authToken : getAuthToken();
    if (!authToken) {
      throw new Error('Must be authenticated to fetch quotas');
    }
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const requestConfig: AxiosRequestConfig = {
      responseType: 'json',
      headers: headers,
      ...getAxiosReqParams(innerReqConfig, CACHE_CONFIG_NOCACHE),
    };
    if (!!TDPICollectionId) {
      requestConfig.params = { collectionId: TDPICollectionId };
    }
    const res = await axios.get(`${TPDI_SERVICE_URL}/quotas`, requestConfig);
    return res.data;
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
    return await getQuotasInner(TDPICollectionId, reqConfig);
  }

  public static async getQuotas(reqConfig?: RequestConfiguration): Promise<Quota> {
    return await getQuotasInner(null, reqConfig);
  }

  public static async search(
    provider: TPDProvider,
    params: TPDISearchParams,
    reqConfig?: RequestConfiguration,
  ): Promise<any> {
    const tpdp = getThirdPartyDataProvider(provider);
    return await tpdp.search(params, reqConfig);
  }
}
