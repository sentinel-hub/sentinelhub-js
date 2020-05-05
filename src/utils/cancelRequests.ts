import axios, { CancelTokenSource, CancelToken } from 'axios';

export class CancelFactory {
  protected source: CancelTokenSource;
  private constructor() {
    this.source = axios.CancelToken.source();
  }

  public static createSource = (): CancelFactory => {
    return new CancelFactory();
  };

  public getToken(): CancelToken {
    return this.source.token;
  }

  public cancel(): void {
    this.source.cancel();
  }
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};
