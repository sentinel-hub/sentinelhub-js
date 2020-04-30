import axios from 'axios';

export const cancelFactory = () => {
  return axios.CancelToken.source();
};

export const isCancelled = (error) => {
  return axios.isCancel(error);
};
