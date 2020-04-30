import axios, { CancelTokenSource } from 'axios';

export const cancelFactory = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

export const isCancelled = (err: Error): boolean => {
  return axios.isCancel(err);
};
