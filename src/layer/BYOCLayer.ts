import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_BYOC } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from 'src/layer/processing';

type BYOCFindTilesDatasetParameters = {
  type: string;
  collectionId: string;
};

export class BYOCLayer extends AbstractSentinelHubV3Layer {
  public readonly dataset = DATASET_BYOC;
  protected collectionId: string;

  public constructor(
    instanceId: string | null,
    layerId: string | null = null,
    evalscript: string | null = null,
    evalscriptUrl: string | null = null,
    dataProduct: string | null = null,
    title: string | null = null,
    description: string | null = null,
    collectionId: string | null = null,
  ) {
    super(instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description);
    this.collectionId = collectionId;
  }

  private shouldFetchAdditionalParams(): boolean {
    if (this.collectionId === null) {
      if (this.instanceId === null || this.layerId === null) {
        throw new Error(
          "Parameter collectionId is not set and can't be fetched from service because instanceId and layerId are not available",
        );
      }
      return true;
    }
    return false;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    if (this.shouldFetchAdditionalParams()) {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3();
      this.collectionId = layerParams['collectionId'];
    }
    payload.input.data[0].dataFilter.collectionId = this.collectionId;
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Moment,
    toTime: Moment,
    maxCount?: number,
    offset?: number,
  ): Promise<PaginatedTiles> {
    if (this.shouldFetchAdditionalParams()) {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3();
      this.collectionId = layerParams['collectionId'];
    }

    const findTilesDatasetParameters: BYOCFindTilesDatasetParameters = {
      type: 'BYOC',
      collectionId: this.collectionId,
    };
    const response = await this.fetchTiles(
      bbox,
      fromTime,
      toTime,
      maxCount,
      offset,
      null,
      findTilesDatasetParameters,
    );
    return {
      tiles: response.data.tiles.map(tile => {
        return {
          geometry: tile.dataGeometry,
          sensingTime: moment.utc(tile.sensingTime),
          meta: {
            cloudCoverPercent: tile.cloudCoverPercentage,
          },
        };
      }),
      hasMore: response.data.hasMore,
    };
  }

  protected createSearchIndexRequestConfig(): AxiosRequestConfig {
    return {};
  }

  protected async getFindDatesAdditionalParameters(): Promise<Record<string, any>> {
    if (this.shouldFetchAdditionalParams()) {
      const layerParams = await this.fetchLayerParamsFromSHServiceV3();
      this.collectionId = layerParams['collectionId'];
    }

    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
        collectionId: this.collectionId,
      },
    };

    return result;
  }

  public async findDates(bbox: BBox, fromTime: Date, toTime: Date): Promise<Date[]> {
    if (!this.dataset.findDatesUrl) {
      throw new Error('This dataset does not support searching for dates');
    }

    const additionalFindDatesParameters = await this.getFindDatesAdditionalParameters();
    const bboxPolygon = bbox.toGeoJSON();
    const payload: any = {
      queryArea: bboxPolygon,
      from: fromTime.toISOString(),
      to: toTime.toISOString(),
      ...additionalFindDatesParameters,
    };
    const response = await axios.post(this.dataset.findDatesUrl, payload);
    return response.data.map((date: string) => moment.utc(date).toDate());
  }
}
