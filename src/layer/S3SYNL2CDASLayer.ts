import moment from 'moment';

import { DATASET_CDAS_S3SYNERGYL2 } from './dataset';
import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { RequestConfiguration } from '../utils/cancelRequests';

import { PaginatedTiles, Link, LinkType, FindTilesAdditionalParameters, DataProductId } from './const';
import { ProcessingPayload } from './processing';

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
  highlights?: AbstractSentinelHubV3WithCCLayer['highlights'];
  s3Type?: string | null;
}

type S3SYNL2FindTilesDatasetParameters = {
  type?: string;
  s3Type?: string | null;
};

export class S3SYNL2CDASLayer extends AbstractSentinelHubV3WithCCLayer {
  public readonly dataset = DATASET_CDAS_S3SYNERGYL2;
  public s3Type: string | null;

  public constructor(props: ConstructorParameters) {
    super(props);
    this.s3Type = props.s3Type;
  }

  public async _updateProcessingGetMapPayload(
    payload: ProcessingPayload,
    datasetSeqNo: number = 0,
  ): Promise<ProcessingPayload> {
    payload = await super._updateProcessingGetMapPayload(payload);
    payload.input.data[datasetSeqNo].dataFilter.s3Type = this.s3Type;
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

  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      s3Type: tile.s3Type,
    };
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    let result: Record<string, any> = {};

    if (!feature) {
      return result;
    }

    result = {
      ...super.extractFindTilesMetaFromCatalog(feature),
      s3Type: feature.properties['s3:type'],
    };

    return result;
  }

  protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters {
    const findTilesDatasetParameters: S3SYNL2FindTilesDatasetParameters = {
      type: this.dataset.shProcessingApiDatasourceAbbreviation,
      s3Type: this.s3Type,
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
      },
    };

    if (this.s3Type) {
      result.datasetParameters.s3Type = this.s3Type;
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

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (assets.data && assets.data.href) {
      result.push({ target: assets.data.href.replace('s3://DIAS', '/dias'), type: LinkType.CREODIAS });
    }
    return result;
  }

  protected createCatalogFilterQuery(
    maxCloudCoverPercent?: number | null,
    datasetParameters?: Record<string, any> | null,
  ): Record<string, any> {
    let result = { ...super.createCatalogFilterQuery(maxCloudCoverPercent, datasetParameters) };

    let conditions = [];
    if (result) {
      conditions.push(result);
    }

    if (this.s3Type) {
      conditions.push({
        op: '=',
        args: [
          {
            property: 's3:type',
          },
          this.s3Type,
        ],
      });
    }

    // combine multiple conditions with AND
    if (conditions.length > 1) {
      result = {
        op: 'and',
        args: conditions,
      };
    } else if (conditions.length === 1) {
      result = conditions[0];
    }

    return result && Object.keys(result).length > 0 ? result : null;
  }
}
