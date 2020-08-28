import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jest-canvas-mock';

import { ApiType, setAuthToken, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { constructFixtureGetMapTiff, constructFixtureGetMapJPEG } from './fixtures.getHugeMap';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

beforeEach(async () => {
  await invalidateCaches();
});

test('getHugeMap should throw an error when format is not supported', async () => {
  const { layer, getMapParams } = constructFixtureGetMapTiff();
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layer.getHugeMap(getMapParams, ApiType.PROCESSING);
  } catch (e) {
    expect(e.message).toBe('getHugeMap does not support image/tiff only PNG and JPEG are supported');
  }
});
