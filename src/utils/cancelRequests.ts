import axios, { CancelTokenSource } from 'axios';

export class CancelFactory {
  protected static source: CancelTokenSource | null = null;

  public static createSource = (): CancelTokenSource => {
    if (CancelFactory.source === null) {
      CancelFactory.source = axios.CancelToken.source();
    }
    return CancelFactory.source;
  };
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};
