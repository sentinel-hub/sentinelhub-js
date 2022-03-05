import { TPDProvider, TPDISearchParams, PlanetItemType, TPDIOrderParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class PlanetDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.PLANET;
  }

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    //itemType is a required parameter witl value of PlanetItemType

    data.itemType = PlanetItemType;

    //productBundle

    if (!!params.productBundle) {
      data.productBundle = params.productBundle;
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

  protected getAdditionalOrderParams(
    items: string[],
    searchParams: TPDISearchParams,
    orderParams: TPDIOrderParams,
  ): any {
    const input = this.getSearchPayload(searchParams);
    const dataObject = input.data[0];

    if (orderParams?.harmonizeTo) {
      dataObject.harmonizeTo = orderParams.harmonizeTo;
    }

    if (orderParams?.planetApiKey) {
      input.planetApiKey = orderParams.planetApiKey;
    }

    if (!!items && items.length) {
      dataObject.itemIds = items;
      delete dataObject.dataFilter;
    }
    return input;
  }
}
