import { BBox, CRS_EPSG4326, setAuthToken, LocationIdSHv3 } from '../../index';
import { SHV3_LOCATIONS_ROOT_URL } from '../const';
import { constructFixtureFindTilesSearchIndex, constructFixtureFindTilesCatalog } from './fixtures.BYOCLayer';

import {
  AUTH_TOKEN,
  checkIfCorrectEndpointIsUsed,
  checkRequestFindTiles,
  checkResponseFindTiles,
  mockNetwork,
} from './testUtils.findTiles';

const SEARCH_INDEX_URL = `${
  SHV3_LOCATIONS_ROOT_URL[LocationIdSHv3.awsEuCentral1]
}byoc/v3/collections/CUSTOM/searchIndex`;
const CATALOG_URL = `${SHV3_LOCATIONS_ROOT_URL[LocationIdSHv3.awsEuCentral1]}api/v1/catalog/search`;

const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

const layerParamsArr: Record<string, any>[] = [
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
  },
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    collectionId: 'mockCollectionId',
  },
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    collectionId: 'mockCollectionId',
    locationId: 'mockLocationId',
  },
];

describe('Test findTiles using searchIndex', () => {
  beforeEach(async () => {
    setAuthToken(null);
    mockNetwork.reset();
  });

  test('searchIndex is used if token is not set', async () => {
    await checkIfCorrectEndpointIsUsed(null, constructFixtureFindTilesSearchIndex({}), SEARCH_INDEX_URL);
  });

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    const fixtures = constructFixtureFindTilesSearchIndex(layerParams);
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

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    const fixtures = constructFixtureFindTilesCatalog(layerParams);
    await checkRequestFindTiles(fixtures);
  });

  test('response from catalog', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesCatalog({}));
  });
});

test.todo('check if correct location is used');
