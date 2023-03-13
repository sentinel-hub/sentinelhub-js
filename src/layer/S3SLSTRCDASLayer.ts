import { DATASET_CDAS_S3SLSTR } from './dataset';

import { S3SLSTRLayer } from './S3SLSTRLayer';

export class S3SLSTRCDASLayer extends S3SLSTRLayer {
  public readonly dataset = DATASET_CDAS_S3SLSTR;

  public async getStats(): Promise<any> {
    throw new Error('getStats() not implemented for this dataset');
  }
}
