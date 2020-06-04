import { ensureTimeout } from '../ensureTimeout';
import axios from 'axios';

// a basic http request that should take more than 1 ms
const testRequest = async (): Promise<any> => {
  const response = await axios.get('https://www.google.com/');
  return response;
};

const testTimeout = async (): Promise<any> => {
  const value = await ensureTimeout({ timeout: 1 }, testRequest);
  return value;
};

describe('ensure timeout', () => {
  it('triggers a network request', async () => {
    const response = await testRequest();
    expect(response).toEqual({ data: {} });
  });

  it('ensure timeout throws after the timeout', async () => {
    try {
      await testTimeout();
    } catch (e) {
      expect(e).toBe('Cancel token not created right!');
    }
  });
});
