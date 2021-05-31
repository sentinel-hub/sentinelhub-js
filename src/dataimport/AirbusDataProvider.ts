import { TPDProvider, TPDISearchParams } from './const';
import { AbstractTPDProvider } from './TPDProvider';

export class AirbusDataProvider extends AbstractTPDProvider {
  public constructor() {
    super();
    this.provider = TPDProvider.AIRBUS;
  }

  protected getAdditionalSearchParams(params: TPDISearchParams): any {
    const data: any = {};

    //constellation is a required parameter
    if (!params.constellation) {
      throw new Error('Parameter constellation must be specified');
    }
    data.constellation = params.constellation;

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

    if (!!params.processingLevel) {
      dataFilter.processingLevel = params.processingLevel;
    }

    if (!isNaN(params.maxSnowCoverage)) {
      dataFilter.maxSnowCoverage = params.maxSnowCoverage;
    }

    if (!isNaN(params.maxIncidenceAngle)) {
      dataFilter.maxIncidenceAngle = params.maxIncidenceAngle;
    }

    if (!!params.expiredFromTime && !!params.expiredToTime) {
      dataFilter.expirationDate = {
        from: params.expiredFromTime.toISOString(),
        to: params.expiredToTime.toISOString(),
      };
    }

    data.dataFilter = dataFilter;

    return { data: [data] };
  }
}
