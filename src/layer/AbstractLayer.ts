import axios from 'axios';

import { GetMapParams, ApiType, PaginatedTiles } from 'src/layer/const';
import { BBox } from 'src/bbox';
import { Dataset } from 'src/layer/dataset';
import { IRequestConfig } from 'src/utils/axiosInterceptors';

export class AbstractLayer {
  public title: string | null = null;
  public description: string | null = null;
  public readonly dataset: Dataset | null = null;

  public constructor(title: string | null = null, description: string | null = null) {
    this.title = title;
    this.description = description;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getMap(params: GetMapParams, api: ApiType): Promise<Blob> {
    switch (api) {
      case ApiType.WMS:
        const url = this.getMapUrl(params, api);
        const requestConfig: IRequestConfig = { responseType: 'blob', useCache: true };
        const response = await axios.get(url, requestConfig);
        return response.data;
      default:
        const className = this.constructor.name;
        throw new Error(`API type "${api}" not supported in ${className}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getMapUrl(params: GetMapParams, api: ApiType): string {
    throw new Error('Not implemented');
  }

  public findTiles(
    bbox: BBox, // eslint-disable-line @typescript-eslint/no-unused-vars
    fromTime: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxCount?: number, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset?: number, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<PaginatedTiles> {
    throw new Error('Not implemented yet');
  }
}
