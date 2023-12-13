import { TPDProvider, TPDISearchParams, TPDITransactionParams, PlanetSupportedPVIds } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class PlanetaryVariablesDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.PLANETARY_VARIABLES;
  }

  protected getSearchParamsProvider(): TPDProvider {
    return TPDProvider.PLANET;
  }

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    if (!params.type) {
      throw new Error('Parameter type must be specified');
    }

    if (!params.id) {
      throw new Error('Parameter id must be specified');
    }

    data.type = params.type;
    data.id = params.id;

    //check if id is supported for selected type
    if (PlanetSupportedPVIds[params.type] && !PlanetSupportedPVIds[params.type].includes(params.id)) {
      throw new Error(`Source ID is not supported for selected Source Type`);
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
