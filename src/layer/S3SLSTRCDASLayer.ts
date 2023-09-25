import { DATASET_CDAS_S3SLSTR } from './dataset';
import { S3SLSTRLayer } from './S3SLSTRLayer';

export class S3SLSTRCDASLayer extends S3SLSTRLayer {
  public readonly dataset = DATASET_CDAS_S3SLSTR;
}
