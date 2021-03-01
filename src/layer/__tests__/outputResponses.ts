import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { ApiType, setAuthToken, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { constructFixtureGetMapOutputResponses } from './fixtures.outputResponses';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

beforeEach(async () => {
  await invalidateCaches();
});

test('Error if output responses is empty array in getMapParams', async () => {
  const { layer, getMapParamsEmptyOutputResponses } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layer.getMap(getMapParamsEmptyOutputResponses, ApiType.PROCESSING);
  } catch (e) {
    expect(e.message).toBe('outputResponses can only have 1 element');
  }
});

test('Error if multiple output responses are set in getMapParams', async () => {
  const { layer, getMapParamsMultipleOutputResponses } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layer.getMap(getMapParamsMultipleOutputResponses, ApiType.PROCESSING);
  } catch (e) {
    expect(e.message).toBe('outputResponses can only have 1 element');
  }
});

it('Success if one output response is set in getMapParams', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  const { layer, getMapParamsDefaultResponse, mockedResponse } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layer.getMap(getMapParamsDefaultResponse, ApiType.PROCESSING);

  expect(mockNetwork.history.post.length).toBe(1);
});

it("Success if getMapParams doesn't contain output responses", async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  const { layer, getMapParams, mockedResponse } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layer.getMap(getMapParams, ApiType.PROCESSING);

  expect(mockNetwork.history.post.length).toBe(1);
});
