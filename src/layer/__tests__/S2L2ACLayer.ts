import { setAuthToken } from '../../index';
import { BBox, CRS_EPSG4326 } from '../../index';
import {
  constructFixtureFindTilesSearchIndex,
  constructFixtureFindTilesCatalog,
} from './fixtures.S2L2ALayer';

import {
  AUTH_TOKEN,
  CATALOG_URL,
  checkIfCorrectEndpointIsUsed,
  checkRequestFindTiles,
  checkResponseFindTiles,
  mockNetwork,
} from './testUtils.findTiles';

const SEARCH_INDEX_URL = 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex';

describe('Test findTiles using searchIndex', () => {
  beforeEach(async () => {
    setAuthToken(null);
    mockNetwork.reset();
  });

  test('searchIndex is used if token is not set', async () => {
    await checkIfCorrectEndpointIsUsed(null, constructFixtureFindTilesSearchIndex({}), SEARCH_INDEX_URL);
  });

  test.each([20, 0, null])('check if correct request is constructed', async maxCloudCoverPercent => {
    const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
    const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const fixtures = constructFixtureFindTilesSearchIndex({
      fromTime: fromTime,
      toTime: toTime,
      bbox: bbox,
      maxCloudCoverPercent: maxCloudCoverPercent,
    });
    await checkRequestFindTiles(fixtures);
  });

  test('response from searchIndex', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesSearchIndex({}));
  });
});

describe('Test findTiles using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('Catalog is used if token is set', async () => {
    await checkIfCorrectEndpointIsUsed(AUTH_TOKEN, constructFixtureFindTilesCatalog({}), CATALOG_URL);
  });

  test.each([[20, 0, null]])('check if correct request is constructed', async maxCloudCoverPercent => {
    const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
    const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const fixtures = constructFixtureFindTilesCatalog({
      fromTime: fromTime,
      toTime: toTime,
      bbox: bbox,
      maxCloudCoverPercent: maxCloudCoverPercent,
    });
    await checkRequestFindTiles(fixtures);
  });

  test('response from catalog', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesCatalog({}));
  });
});
