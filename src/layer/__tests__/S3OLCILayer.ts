import { BBox, CRS_EPSG4326, S3OLCILayer, setAuthToken } from '../../index';
import { constructFixtureFindTilesCatalog } from './fixtures.S3OLCILayer';

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

import { constructFixtureFindDatesUTCCatalog } from './fixtures.findDatesUTC';
import { checkLayersParamsEndpoint } from './testUtils.layers';

const CATALOG_URL = 'https://creodias.sentinel-hub.com/api/v1/catalog/1.0.0/search';

const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

const layerParamsArr: Record<string, any>[] = [
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
  },
];

describe('Test findTiles using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('Catalog is used if token is set', async () => {
    await checkIfCorrectEndpointIsUsed(
      AUTH_TOKEN,
      constructFixtureFindTilesCatalog(S3OLCILayer, {}),
      CATALOG_URL,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    const fixtures = constructFixtureFindTilesCatalog(S3OLCILayer, layerParams);
    await checkRequestFindTiles(fixtures);
  });

  test('response from catalog', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesCatalog(S3OLCILayer, {}));
  });
});

describe('Test findDatesUTC using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('catalog is used if token is set', async () => {
    const layer = new S3OLCILayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      AUTH_TOKEN,
      constructFixtureFindDatesUTCCatalog(layer, {}),
      CATALOG_URL,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    let constructorParams: Record<string, any> = {};

    const layer = new S3OLCILayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCCatalog(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S3OLCILayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkResponseFindDatesUTC(constructFixtureFindDatesUTCCatalog(layer, {}));
  });
});

describe('correct endpoint is used for layer params', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('updateLayerFromServiceIfNeeded', async () => {
    await checkLayersParamsEndpoint(mockNetwork, S3OLCILayer, 'https://services.sentinel-hub.com');
  });
});
