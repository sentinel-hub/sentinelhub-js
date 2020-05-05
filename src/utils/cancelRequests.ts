import axios, { CancelTokenSource } from 'axios';

export class CancelFactory {
  protected source: CancelTokenSource;
  private constructor() {
    this.source = axios.CancelToken.source();
  }

  public static createSource = () => {
    return new CancelFactory();
  };

  public getToken() {
    return this.source.token;
  }

  public cancel() {
    this.source.cancel();
  }
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};
