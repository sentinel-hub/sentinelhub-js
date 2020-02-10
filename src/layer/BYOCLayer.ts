import { AxiosRequestConfig } from 'axios';
import { BBox } from 'src/bbox';
import { PaginatedTiles } from 'src/layer/const';
import { DATASET_BYOC } from 'src/layer/dataset';
import { AbstractSentinelHubV3Layer } from 'src/layer/AbstractSentinelHubV3Layer';
import { ProcessingPayload } from './processing';

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
    fromTime: Date,
    toTime: Date,
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
          sensingTime: tile.sensingTime,
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
}
