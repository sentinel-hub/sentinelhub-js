import { BBox, CRS_EPSG4326, setAuthToken, LocationIdSHv3, BYOCLayer, DATASET_BYOC } from '../../index';
import { SHV3_LOCATIONS_ROOT_URL } from '../const';
import { constructFixtureFindTilesSearchIndex, constructFixtureFindTilesCatalog } from './fixtures.BYOCLayer';

import {
  AUTH_TOKEN,
  checkIfCorrectEndpointIsUsed,
  checkRequestFindTiles,
  checkResponseFindTiles,
  mockNetwork,
} from './testUtils.findTiles';

import {
  checkIfCorrectEndpointIsUsedFindDatesUTC,
  checkRequestFindDatesUTC,
  checkResponseFindDatesUTC,
} from './testUtils.findDatesUTC';

import {
  constructFixtureFindDatesUTCSearchIndex,
  constructFixtureFindDatesUTCCatalog,
} from './fixtures.findDatesUTC';

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

describe('Test findDatesUTC using searchIndex', () => {
  beforeEach(async () => {
    setAuthToken(null);
    mockNetwork.reset();
  });

  test('findAvailableData is used if token is not set', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      collectionId: 'mockCollectionId',
      locationId: LocationIdSHv3.awsEuCentral1,
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      null,
      constructFixtureFindDatesUTCSearchIndex(layer, {}),
      'https://services.sentinel-hub.com/byoc/v3/collections/CUSTOM/findAvailableData',
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    let constructorParams: Record<string, any> = {};
    if (layerParams && layerParams.collectionId) {
      constructorParams.collectionId = layerParams.collectionId;
    }

    if (layerParams && layerParams.locationId) {
      constructorParams.locationId = layerParams.locationId;
    }

    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCSearchIndex(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      collectionId: 'mockCollectionId',
      locationId: LocationIdSHv3.awsEuCentral1,
    });
    await checkResponseFindDatesUTC(constructFixtureFindDatesUTCSearchIndex(layer, {}));
  });
});
describe('Test findDatesUTC using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('catalog is used if token is set', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      collectionId: 'mockCollectionId',
      locationId: LocationIdSHv3.awsEuCentral1,
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      AUTH_TOKEN,
      constructFixtureFindDatesUTCCatalog(layer, {}),
      CATALOG_URL,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    let constructorParams: Record<string, any> = {};
    if (layerParams && layerParams.collectionId) {
      constructorParams.collectionId = layerParams.collectionId;
    }
    if (layerParams && layerParams.locationId) {
      constructorParams.locationId = layerParams.locationId;
    }
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCCatalog(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      collectionId: 'mockCollectionId',
      locationId: LocationIdSHv3.awsEuCentral1,
    });
    await checkResponseFindDatesUTC(constructFixtureFindDatesUTCCatalog(layer, {}));
  });
});

test.todo('check if correct location is used');
