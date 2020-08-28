import { ApiType, setAuthToken, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { constructFixtureGetMapTiff } from './fixtures.getHugeMap';

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
    expect(e.message).toBe('Format image/tiff not supported, only image/png and image/jpeg are allowed');
  }
});
