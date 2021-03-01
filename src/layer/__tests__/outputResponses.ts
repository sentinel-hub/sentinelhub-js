import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { ApiType, setAuthToken, invalidateCaches, S2L2ALayer } from '../../index';

import '../../../jest-setup';
import { constructFixtureGetMapOutputResponses } from './fixtures.outputResponses';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

beforeEach(async () => {
  await invalidateCaches();
});

test('Error if outputResponseId is empty string in getMapParams', async () => {
  const { layer, getMapParamsEmptyOutputResponseId } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layer.getMap(getMapParamsEmptyOutputResponseId, ApiType.PROCESSING);
  } catch (e) {
    expect(e.message).toBe('outputResponseId most not be empty');
  }
});

test('Error if outputResponseId is used with WMS', async () => {
  const { getMapParamsDefaultResponseId } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    const layer = new S2L2ALayer({ instanceId: 'INSTANCE_ID', layerId: 'LAYER_ID' });
    await layer.getMap(getMapParamsDefaultResponseId, ApiType.WMS);
  } catch (e) {
    expect(e.message).toBe('outputResponseId is only available with Processing API');
  }
});

test('Error if outputResponseId is empty and used with WMS', async () => {
  const { getMapParamsEmptyOutputResponseId } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    const layer = new S2L2ALayer({ instanceId: 'INSTANCE_ID', layerId: 'LAYER_ID' });
    await layer.getMap(getMapParamsEmptyOutputResponseId, ApiType.WMS);
  } catch (e) {
    expect(e.message).toBe('outputResponseId is only available with Processing API');
  }
});

it('Success if outputResponseId is set correctly in getMapParams', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  const { layer, getMapParamsDefaultResponseId, mockedResponse } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layer.getMap(getMapParamsDefaultResponseId, ApiType.PROCESSING);

  expect(mockNetwork.history.post.length).toBe(1);
});

it('Success if outputResponseId is not set in getMapParams', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  const { layer, getMapParams, mockedResponse } = constructFixtureGetMapOutputResponses();
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layer.getMap(getMapParams, ApiType.PROCESSING);

  expect(mockNetwork.history.post.length).toBe(1);
});
