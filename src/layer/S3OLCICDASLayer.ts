import { DATASET_CDAS_S3OLCI } from './dataset';
import { S3OLCILayer } from './S3OLCILayer';

export class S3OLCICDASLayer extends S3OLCILayer {
  public readonly dataset = DATASET_CDAS_S3OLCI;
}
