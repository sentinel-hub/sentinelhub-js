export default {
  get: jest.fn(() => {
    console.log('Mocking axios.get!');
    return Promise.resolve({ data: {} });
  }),
};
