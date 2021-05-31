import { RequestConfiguration } from '../utils/cancelRequests';
import { getQuotasInner } from './quotas';
import { Quota, TPDICollections, TPDProvider, TPDISearchParams } from './const';
import { AirbusDataProvider } from './AirbusDataProvider';
import { PlanetDataProvider } from './PlanetDataProvider';
import { MaxarDataProvider } from './MaxarDataProvider';
import { TPDProviderInterface } from './TPDProvider';

const dataProviders = [new AirbusDataProvider(), new PlanetDataProvider(), new MaxarDataProvider()];

export function getThirdPartyDataProvider(provider: TPDProvider): TPDProviderInterface {
  const tpdp = dataProviders.find(p => p.getProvider() === provider);
  if (!tpdp) {
    throw new Error(`Unknown data provider ${provider}`);
  }
  return tpdp;
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
