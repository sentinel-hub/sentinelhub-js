import { DATASET_CDAS_S3SLSTRL2 } from './dataset';
import { S3SLSTRLayer } from './S3SLSTRLayer';

export class S3SLSTRL2CDASLayer extends S3SLSTRLayer {
  public readonly dataset = DATASET_CDAS_S3SLSTRL2;
}
