import { DATASET_CDAS_S3OLCIL2 } from './dataset';
import { S3SLSTRCDASLayer } from './S3SLSTRCDASLayer';

import { Link, LinkType } from './const';

export class S3OLCIL2CDASLayer extends S3SLSTRCDASLayer {
  public readonly dataset = DATASET_CDAS_S3OLCIL2;

  protected getTileLinksFromCatalog(feature: Record<string, any>): Link[] {
    const { assets } = feature;
    let result: Link[] = super.getTileLinksFromCatalog(feature);

    if (assets.data && assets.data.href) {
      result.push({ target: assets.data.href.replace('s3://DIAS', '/dias'), type: LinkType.CREODIAS });
    }
    return result;
  }
}
