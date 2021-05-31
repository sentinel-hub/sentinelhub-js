import { RequestConfiguration } from '../utils/cancelRequests';
import { getQuotasInner } from './quotas';
import { Quota, TPDICollections } from './const';

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
}
