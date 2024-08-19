import { DATASET_CDAS_S3OLCIL2 } from './dataset';
import { S3SLSTRCDASLayer } from './S3SLSTRCDASLayer';

export class S3OLCIL2CDASLayer extends S3SLSTRCDASLayer {
  public readonly dataset = DATASET_CDAS_S3OLCIL2;
}
