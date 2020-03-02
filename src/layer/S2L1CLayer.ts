import { DATASET_S2L1C } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from 'src/layer/processing';
import { BBox } from 'src/bbox';

export class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S2L1C;

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload.input.data[0].dataFilter.maxCloudCoverage = this.maxCloudCoverPercent;
    return payload;
  }

  protected getWmsGetMapUrlAdditionalParameters(): Record<string, any> {
    return {
      maxcc: this.maxCloudCoverPercent,
    };
  }

  public async findDates(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    datasetSpecificParameters?: {
      maxCloudCoverage?: number;
    },
  ): Promise<Date[]> {
    return super.findDates(bbox, fromTime, toTime, {
      maxCloudCoverage: datasetSpecificParameters && datasetSpecificParameters.maxCloudCoverage,
    });
  }
}
