import { DATASET_CDAS_S2L1C, S2L1CCDASLayer, setAuthToken } from '../../index';
import { ApiType, BBox, CRS_EPSG4326 } from '../../index';
import {
  constructFixtureFindTilesSearchIndex,
  constructFixtureFindTilesCatalog,
} from './fixtures.S2L1CCDASLayer';

import {
  AUTH_TOKEN,
  CATALOG_URL,
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
import { checkLayersParamsEndpoint } from './testUtils.layers';

const SEARCH_INDEX_URL = 'https://sh.dataspace.copernicus.eu/index/v3/collections/S2L1C/searchIndex';

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
    maxCloudCoverPercent: 20,
  },
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    maxCloudCoverPercent: 0,
  },
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    maxCloudCoverPercent: null,
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

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
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
    await checkIfCorrectEndpointIsUsed(
      AUTH_TOKEN,
      constructFixtureFindTilesCatalog({}),
      CATALOG_URL.replace('https://services.sentinel-hub.com', 'https://sh.dataspace.copernicus.eu'),
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
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
    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      null,
      constructFixtureFindDatesUTCSearchIndex(layer, {}),
      DATASET_CDAS_S2L1C.findDatesUTCUrl,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    let constructorParams: Record<string, any> = {};
    if (layerParams.maxCloudCoverPercent !== null && layerParams.maxCloudCoverPercent !== undefined) {
      constructorParams.maxCloudCoverPercent = layerParams.maxCloudCoverPercent;
    }

    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCSearchIndex(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
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
    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      AUTH_TOKEN,
      constructFixtureFindDatesUTCCatalog(layer, {}),
      CATALOG_URL.replace('https://services.sentinel-hub.com', 'https://sh.dataspace.copernicus.eu'),
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    let constructorParams: Record<string, any> = {};
    if (layerParams.maxCloudCoverPercent !== null && layerParams.maxCloudCoverPercent !== undefined) {
      constructorParams.maxCloudCoverPercent = layerParams.maxCloudCoverPercent;
    }

    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCCatalog(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S2L1CCDASLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkResponseFindDatesUTC(constructFixtureFindDatesUTCCatalog(layer, {}));
  });
});

test.each([
  ['https://services.sentinel-hub.com/api/v2/configuration/datasets/S2L1C/dataproducts/99999', false],
  ['https://services.sentinel-hub.com/api/v2/configuration/datasets/S2L1C/dataproducts/643', true],
])(
  'AbstractSentinelHubV3Layer.supportsApiType correctly handles DataProducts supported by Processing API',
  (dataProduct, expectedResult) => {
    const layer = new S2L1CCDASLayer({
      dataProduct: dataProduct,
    });
    expect(layer.supportsApiType(ApiType.PROCESSING)).toBe(expectedResult);
  },
);

describe('correct endpoint is used for layer params', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('updateLayerFromServiceIfNeeded', async () => {
    await checkLayersParamsEndpoint(mockNetwork, S2L1CCDASLayer, 'https://sh.dataspace.copernicus.eu');
  });
});
