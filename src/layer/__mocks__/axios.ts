export default {
  get: jest.fn(() => {
    console.log('Mocking axios.get!');
    return Promise.resolve({ data: {} });
  }),
  interceptors: {
    request: {
      use: () => {},
    },
    response: {
      use: () => {},
    },
  }
};
