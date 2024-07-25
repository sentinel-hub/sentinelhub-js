import { DATASET_CDAS_S3OLCIL2 } from './dataset';
import { S3OLCILayer } from './S3OLCILayer';

export class S3OLCIL2CDASLayer extends S3OLCILayer {
  public readonly dataset = DATASET_CDAS_S3OLCIL2;
}
