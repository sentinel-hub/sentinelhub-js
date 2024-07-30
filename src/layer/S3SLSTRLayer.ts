import moment from 'moment';

import {
  PaginatedTiles,
  OrbitDirection,
  Link,
  LinkType,
  DataProductId,
  FindTilesAdditionalParameters,
} from './const';
import { DATASET_S3SLSTR } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';

interface ConstructorParameters {
  instanceId?: string | null;
  layerId?: string | null;
  evalscript?: string | null;
  evalscriptUrl?: string | null;
  dataProduct?: DataProductId | null;
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

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload = await super._updateProcessingGetMapPayload(payload);
    payload.input.data[datasetSeqNo].dataFilter.orbitDirection = this.orbitDirection;
    payload.input.data[datasetSeqNo].processing.view = this.view;
    return payload;
  }

  protected convertResponseFromSearchIndex(response: {
    data: { tiles: any[]; hasMore: boolean };
  }): PaginatedTiles {
    return {
      tiles: response.data.tiles.map((tile) => ({
        geometry: tile.dataGeometry,
        sensingTime: moment.utc(tile.sensingTime).toDate(),
        meta: this.extractFindTilesMeta(tile),
        links: this.getTileLinks(tile),
      })),
      hasMore: response.data.hasMore,
    };
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: S3SLSTRFindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      orbitDirection: this.orbitDirection,
      view: this.view,
    };

    return {
      maxCloudCoverPercent: this.maxCloudCoverPercent,
      datasetParameters: findTilesDatasetParameters,
    };
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

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    let result: Record<string, any> = {};

    if (!feature) {
      return result;
    }

    result = {
      ...super.extractFindTilesMetaFromCatalog(feature),
      orbitDirection: feature.properties['sat:orbit_state'],
    };

    return result;
  }

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (assets.data && assets.data.href) {
      result.push({ target: assets.data.href.replace('s3://EODATA', '/eodata'), type: LinkType.CREODIAS });
    }
    return result;
  }
}
