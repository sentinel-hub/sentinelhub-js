import { TPDProvider, TPDISearchParams, PlanetSupportedProductBundles, TPDITransactionParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class PlanetDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.PLANET;
  }

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    //itemType is a required parameter
    if (!params.itemType) {
      throw new Error('Parameter itemType must be specified');
    }

    data.itemType = params.itemType;

    //productBundle is a required parameter
    if (!params.productBundle) {
      throw new Error('Parameter productBundle must be specified');
    }

    data.productBundle = params.productBundle;

    //check if productBundle is supported for selected itemType
    if (
      PlanetSupportedProductBundles[params.itemType] &&
      !PlanetSupportedProductBundles[params.itemType].includes(params.productBundle)
    ) {
      throw new Error(`Product bundle is not supported for selected item type`);
    }

    //datafilter
    const dataFilter: any = {};

    if (!params.fromTime) {
      throw new Error('Parameter fromTime must be specified');
    }

    if (!params.toTime) {
      throw new Error('Parameter toTime must be specified');
    }

    dataFilter.timeRange = {
      from: params.fromTime.toISOString(),
      to: params.toTime.toISOString(),
    };

    if (!isNaN(params.maxCloudCoverage)) {
      dataFilter.maxCloudCoverage = params.maxCloudCoverage;
    }

    if (!!params.nativeFilter) {
      dataFilter.nativeFilter = params.nativeFilter;
    }

    data.dataFilter = dataFilter;

    return {
      data: [data],
    };
  }

  protected getAdditionalTransactionParams(
    items: string[],
    searchParams: TPDISearchParams,
    transactionParams: TPDITransactionParams,
  ): any {
    const input = this.getSearchPayload(searchParams);
    const dataObject = input.data[0];

    if (transactionParams?.harmonizeTo) {
      dataObject.harmonizeTo = transactionParams.harmonizeTo;
    }

    if (!transactionParams?.planetApiKey) {
      throw new Error('Parameter planetApiKey must be specified');
    }

    input.planetApiKey = transactionParams.planetApiKey;

    if (!!items && items.length) {
      dataObject.itemIds = items;
      delete dataObject.dataFilter;
    }
    return input;
  }
  public checkSubscriptionsSupported(): boolean {
    return true;
  }
}
