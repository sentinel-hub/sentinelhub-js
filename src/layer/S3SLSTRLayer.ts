import moment from 'moment';

import { BBox } from 'src/bbox';
import { PaginatedTiles, OrbitDirection, Link, LinkType } from 'src/layer/const';
import { DATASET_S3SLSTR } from 'src/layer/dataset';
import { AbstractSentinelHubV3WithCCLayer } from 'src/layer/AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from 'src/layer/processing';
import { RequestConfiguration } from 'src/utils/cancelRequests';
import { ensureTimeout } from 'src/utils/ensureTimeout';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: string | null;
  title?: string | null;
  description?: string | null;
  legendUrl?: string | null;
  maxCloudCoverPercent?: number | null;
  view?: S3SLSTRView | null;
}

export enum S3SLSTRView {
  NADIR = 'NADIR',
  OBLIQUE = 'OBLIQUE',
}

type S3SLSTRFindTilesDatasetParameters = {
  type?: string;
  orbitDirection?: OrbitDirection;
  view: S3SLSTRView;
};

export class S3SLSTRLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_S3SLSTR;
  public orbitDirection: OrbitDirection | null;
  public view: S3SLSTRView;

  public constructor({ view = S3SLSTRView.NADIR, ...rest }: ConstructorParameters) {
    super(rest);
    // images that are not DESCENDING appear empty:
    this.orbitDirection = OrbitDirection.DESCENDING;
    this.view = view;
  }

  protected async updateProcessingGetMapPayload(payload: ProcessingPayload): Promise<ProcessingPayload> {
    payload = await super.updateProcessingGetMapPayload(payload);
    payload.input.data[0].dataFilter.orbitDirection = this.orbitDirection;
    payload.input.data[0].processing.view = this.view;
    return payload;
  }

  public async findTiles(
    bbox: BBox,
    fromTime: Date,
    toTime: Date,
    maxCount: number | null = null,
    offset: number | null = null,
    reqConfig?: RequestConfiguration,
  ): Promise<PaginatedTiles> {
    const tiles = await ensureTimeout(async innerReqConfig => {
      const findTilesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
        type: this.dataset.shProcessingApiDatasourceAbbreviation,
        orbitDirection: this.orbitDirection,
        view: this.view,
      };
      const response = await this.fetchTiles(
        this.dataset.searchIndexUrl,
        bbox,
        fromTime,
        toTime,
        maxCount,
        offset,
        innerReqConfig,
        this.maxCloudCoverPercent,
        findTilesDatasetParameters,
      );
      return {
        tiles: response.data.tiles.map(tile => ({
          geometry: tile.dataGeometry,
          sensingTime: moment.utc(tile.sensingTime).toDate(),
          meta: this.extractFindTilesMeta(tile),
          links: this.getTileLinks(tile),
        })),
        hasMore: response.data.hasMore,
      };
    }, reqConfig);
    return tiles;
  }

  protected async getFindDatesUTCAdditionalParameters(
    reqConfig: RequestConfiguration, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {
      datasetParameters: {
        type: this.dataset.datasetParametersType,
        view: this.view,
      },
    };
    if (this.orbitDirection !== null) {
      result.datasetParameters.orbitDirection = this.orbitDirection;
    }

    if (this.maxCloudCoverPercent !== null) {
      result.maxCloudCoverage = this.maxCloudCoverPercent / 100;
    }

    return result;
  }

  protected getTileLinks(tile: Record<string, any>): Link[] {
    return [
      {
        target: tile.originalId.replace('EODATA', '/eodata'),
        type: LinkType.CREODIAS,
      },
      {
        target: `https://finder.creodias.eu/files${tile.originalId.replace(
          'EODATA',
          '',
        )}/${tile.productName.replace('.SEN3', '')}-ql.jpg`,
        type: LinkType.PREVIEW,
      },
    ];
  }

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      orbitDirection: tile.orbitDirection,
    };
  }
}
