import axios from 'axios';

export const cancelFactory = () => {
  return axios.CancelToken.source();
};

export const isCancelled = (error: Error) => {
  return axios.isCancel(error);
};
