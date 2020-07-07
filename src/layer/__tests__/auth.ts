import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { constructFixtureGetMap } from './auth.fixtures';
import { ApiType, setAuthToken } from 'src';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN1 = 'TOKEN111';
const EXAMPLE_TOKEN2 = 'TOKEN222';

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