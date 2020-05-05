import axios, { CancelTokenSource } from 'axios';

export class CancelFactory {
  protected source : CancelTokenSource;
  private constructor() {
    this.source = axios.CancelToken.source();
  }

  static createSource = () => {
    return new CancelFactory()
  }

  getToken() {
    return this.source.token;
  }

  cancel() {
    this.source.cancel();
  }
}

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};
