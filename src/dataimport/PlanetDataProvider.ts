import { TPDProvider, TPDISearchParams, PlanetItemType } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class PlanetDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.PLANET;
  }

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    //planetApiKey is a required parameter
    if (!params.planetApiKey) {
      throw new Error('Parameter planetApiKey must be specified');
    }

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
      planetApiKey: params.planetApiKey,
      data: [data],
    };
  }

  protected getAdditionalOrderParams(items: string[], params: TPDISearchParams): any {
    const input = this.getSearchPayload(params);
    if (!!items && items.length) {
      const dataObject = input.data[0];
      dataObject.itemIds = items;
    }
    return input;
  }
}
