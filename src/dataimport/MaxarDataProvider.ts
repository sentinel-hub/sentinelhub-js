import { TPDProvider, TPDISearchParams, MaxarProductBands, TPDITransactionParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class MaxarDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.MAXAR;
  }

  public addSearchPagination(): void {}

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    //productBands is a required parameter with value of MaxarProductBands
    data.productBands = MaxarProductBands;

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

    if (!isNaN(params.minOffNadir)) {
      dataFilter.minOffNadir = params.minOffNadir;
    }

    if (!isNaN(params.maxOffNadir)) {
      dataFilter.maxOffNadir = params.maxOffNadir;
    }

    if (!isNaN(params.minSunElevation)) {
      dataFilter.minSunElevation = params.minSunElevation;
    }

    if (!isNaN(params.maxSunElevation)) {
      dataFilter.maxSunElevation = params.maxSunElevation;
    }

    if (!!params.sensor) {
      dataFilter.sensor = params.sensor;
    }

    data.dataFilter = dataFilter;

    return { data: [data] };
  }

  protected getAdditionalTransactionParams(
    items: string[],
    searchParams: TPDISearchParams,
    transactionParams: TPDITransactionParams,
  ): any {
    const input = this.getSearchPayload(searchParams);
    const dataObject = input.data[0];

    if (transactionParams?.productKernel) {
      dataObject.productKernel = transactionParams.productKernel;
    }

    if (!!items && items.length) {
      dataObject.selectedImages = items;
      delete dataObject.dataFilter;
    }

    return input;
  }
}
