import { BBox, CRS_EPSG4326, setAuthToken, S5PL2CDASLayer } from '../../index';
import { constructFixtureFindTilesCatalog } from './fixtures.S5PL2Layer';

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

import { ProductType } from '../S5PL2Layer';
import { checkLayersParamsEndpoint } from './testUtils.layers';

const CATALOG_URL = 'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search';

const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

const layerParamsArr: Record<string, any>[] = [
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
  },
  ...Object.keys(ProductType).map((productType) => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    productType: productType,
  })),
];

describe('Test findTiles using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('Catalog is used if token is set', async () => {
    await checkIfCorrectEndpointIsUsed(
      AUTH_TOKEN,
      constructFixtureFindTilesCatalog(S5PL2CDASLayer, {}),
      CATALOG_URL,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    const fixtures = constructFixtureFindTilesCatalog(S5PL2CDASLayer, layerParams);
    await checkRequestFindTiles(fixtures);
  });

  test('response from catalog', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesCatalog(S5PL2CDASLayer, {}));
  });
});

describe('Test findDatesUTC using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('catalog is used if token is set', async () => {
    const layer = new S5PL2CDASLayer({
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
    if (layerParams && layerParams.productType) {
      constructorParams.productType = layerParams.productType;
    }
    const layer = new S5PL2CDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCCatalog(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S5PL2CDASLayer({
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
    await checkLayersParamsEndpoint(mockNetwork, S5PL2CDASLayer, 'https://sh.dataspace.copernicus.eu');
  });
});
