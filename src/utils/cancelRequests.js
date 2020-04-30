import axios from 'axios';

export const cancelFactory = () => {
  return axios.CancelToken.source();
};

export const isCancelled = err => {
  return axios.isCancel(err);
};
