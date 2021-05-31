import axios, { AxiosRequestConfig } from 'axios';
import { getAuthToken } from '../auth';
import { CACHE_CONFIG_NOCACHE } from '../utils/cacheHandlers';
import { getAxiosReqParams, RequestConfiguration } from '../utils/cancelRequests';
import { ensureTimeout } from '../utils/ensureTimeout';
import { TPDICollections, TPDI_SERVICE_URL } from './const';

export async function getQuotasInner(
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
      ...getAxiosReqParams(reqConfig, CACHE_CONFIG_NOCACHE),
    };
    if (!!TDPICollectionId) {
      requestConfig.params = { collectionId: TDPICollectionId };
    }
    const res = await axios.get(`${TPDI_SERVICE_URL}/quotas`, requestConfig);
    return res.data;
  }, reqConfig);
}
