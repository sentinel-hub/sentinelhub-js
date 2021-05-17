import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { ApiType, setAuthToken, requestAuthToken, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { constructFixtureGetMap } from './fixtures.auth';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN1 = 'TOKEN111';
const EXAMPLE_TOKEN2 = 'TOKEN222';

beforeEach(async () => {
  await invalidateCaches();
});

test('getMap + Processing throws an exception if authToken is not set', async () => {
  const { layer, getMapParams } = constructFixtureGetMap();
  setAuthToken(null);
  await expect(layer.getMap(getMapParams, ApiType.PROCESSING)).rejects.toThrow();
});

test('setAuthToken sets the Authorization header', async () => {
  const { layer, getMapParams } = constructFixtureGetMap();
  setAuthToken(null);

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, ''); // we don't care about response, we just inspect the request

  setAuthToken(EXAMPLE_TOKEN1);
  await layer.getMap(getMapParams, ApiType.PROCESSING);

  expect(mockNetwork.history.post.length).toBe(1);
  const req = mockNetwork.history.post[0];
  expect(req.headers.Authorization).toBe(`Bearer ${EXAMPLE_TOKEN1}`);
});

test('reqConfig sets the Authorization header', async () => {
  const { layer, getMapParams } = constructFixtureGetMap();
  setAuthToken(null);

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, ''); // we don't care about response, we just inspect the request

  await layer.getMap(getMapParams, ApiType.PROCESSING, { authToken: EXAMPLE_TOKEN2 });

  expect(mockNetwork.history.post.length).toBe(1);
  const req = mockNetwork.history.post[0];
  expect(req.headers.Authorization).toBe(`Bearer ${EXAMPLE_TOKEN2}`);
});

test('reqConfig overrides setAuthToken', async () => {
  const { layer, getMapParams } = constructFixtureGetMap();
  setAuthToken(null);

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, ''); // we don't care about response, we just inspect the request

  setAuthToken(EXAMPLE_TOKEN1);
  await layer.getMap(getMapParams, ApiType.PROCESSING, { authToken: EXAMPLE_TOKEN2 });

  expect(mockNetwork.history.post.length).toBe(1);
  const req = mockNetwork.history.post[0];
  expect(req.headers.Authorization).toBe(`Bearer ${EXAMPLE_TOKEN2}`);
});

test('requestAuthToken correctly encodes URI parameters', async () => {
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, ''); // we only check the request

  await requestAuthToken('asd,321', './*&');

  expect(mockNetwork.history.post.length).toBe(1);
  const req = mockNetwork.history.post[0];
  expect(req.data).toBe('grant_type=client_credentials&client_id=asd%2C321&client_secret=.%2F*%26');
});

test('getMap with different authToken following an identical failed getMap makes a request', async () => {
  const { layer, getMapParams } = constructFixtureGetMap();

  jest.setTimeout(30000);

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(429, '');
  mockNetwork.onPost().replyOnce(429, '');
  mockNetwork.onPost().replyOnce(429, '');
  mockNetwork.onPost().replyOnce(200, '');

  const reqConfig = { authToken: EXAMPLE_TOKEN1, retries: 2 };
  try {
    await layer.getMap(getMapParams, ApiType.PROCESSING, reqConfig);
  } catch (err) {
    expect(err.response.status).toBe(429);
  }

  reqConfig.authToken = EXAMPLE_TOKEN2;
  await layer.getMap(getMapParams, ApiType.PROCESSING, reqConfig);

  expect(mockNetwork.history.post.length).toBe(4);
  expect(mockNetwork.history.post[2].headers.Authorization).toBe(`Bearer ${EXAMPLE_TOKEN1}`);
  expect(mockNetwork.history.post[3].headers.Authorization).toBe(`Bearer ${EXAMPLE_TOKEN2}`);
});
