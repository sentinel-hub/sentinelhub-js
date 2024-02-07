import { CRS_EPSG4326, setAuthToken, LocationIdSHv3, BYOCLayer, CRS_EPSG3857, BBox } from '../../index';
import { SHV3_LOCATIONS_ROOT_URL, BYOCSubTypes, SH_SERVICE_ROOT_URL } from '../const';
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
const CATALOG_URL = `${SHV3_LOCATIONS_ROOT_URL[LocationIdSHv3.awsEuCentral1]}api/v1/catalog/1.0.0/search`;

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
    subType: null,
  },
  {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    collectionId: 'mockCollectionId',
    locationId: 'mockLocationId',
    subType: BYOCSubTypes.BATCH,
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
    if (layerParams && layerParams.subType !== undefined) {
      constructorParams.subType = layerParams.subType;
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

describe('Test updateLayerFromServiceIfNeeded for ZARR', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });
  const mockedLayerId = 'LAYER_ID';
  const mockedLayersResponse = [{ id: mockedLayerId, styles: [{}] }];

  test('AWS EU locationId is set by default if not specified', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: mockedLayerId,
      collectionId: 'mockCollectionId',
      subType: BYOCSubTypes.ZARR,
    });
    expect(layer.locationId).toEqual(null);
    mockNetwork
      .onGet('https://services.sentinel-hub.com/configuration/v1/wms/instances/INSTANCE_ID/layers')
      .replyOnce(200, mockedLayersResponse);
    await layer.updateLayerFromServiceIfNeeded();
    expect(layer.locationId).toEqual(LocationIdSHv3.awsEuCentral1);
  });

  test('location Id is not overridden', async () => {
    const layer = new BYOCLayer({
      instanceId: 'INSTANCE_ID',
      layerId: mockedLayerId,
      collectionId: 'mockCollectionId',
      subType: BYOCSubTypes.ZARR,
      locationId: LocationIdSHv3.creo,
    });
    expect(layer.locationId).toEqual(LocationIdSHv3.creo);
    mockNetwork
      .onGet('https://services.sentinel-hub.com/configuration/v1/wms/instances/INSTANCE_ID/layers')
      .replyOnce(200, mockedLayersResponse);
    await layer.updateLayerFromServiceIfNeeded();
    expect(layer.locationId).toEqual(LocationIdSHv3.creo);
  });
});

describe('shServiceRootUrl', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });
  const mockedLayerId = 'LAYER_ID';

  test.each([
    [
      'default sh service url is used if not set',
      {
        instanceId: 'INSTANCE_ID',
        layerId: mockedLayerId,
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      SH_SERVICE_ROOT_URL.default,
    ],
    [
      'default sh service url is used if set',
      {
        instanceId: 'INSTANCE_ID',
        layerId: mockedLayerId,
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
        shServiceRootUrl: SH_SERVICE_ROOT_URL.default,
      },
      SH_SERVICE_ROOT_URL.default,
    ],
    [
      'cdse sh service url is used if set',
      {
        instanceId: 'INSTANCE_ID',
        layerId: mockedLayerId,
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
        shServiceRootUrl: SH_SERVICE_ROOT_URL.cdse,
      },
      SH_SERVICE_ROOT_URL.cdse,
    ],
    [
      'default sh service url is used for unknown shServiceRootUrl',
      {
        instanceId: 'INSTANCE_ID',
        layerId: mockedLayerId,
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
        shServiceRootUrl: 'random url',
      },
      SH_SERVICE_ROOT_URL.default,
    ],
  ])('%p', async (_title, layerParams, expected) => {
    const layer = new BYOCLayer(layerParams);
    expect(layer.getSHServiceRootUrl()).toBe(expected);
  });
});

describe('shouldUseLowResolutionCollection', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test.each([
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      lowResolutionCollectionId: 'LOW_RESOLUTION_COLLECTION_ID',
      lowResolutionMetersPerPixelThreshold: 300,
      bbox: new BBox(
        CRS_EPSG4326,
        -114.27429199218751,
        45.85176048817254,
        -112.17864990234376,
        48.21003212234042,
      ),
      width: 512,
      expected: true,
    },
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      lowResolutionCollectionId: 'LOW_RESOLUTION_COLLECTION_ID',
      lowResolutionMetersPerPixelThreshold: 300,
      bbox: new BBox(
        CRS_EPSG3857,
        -12601714.2312073,
        5870363.772301538,
        -12523442.714243278,
        5948635.289265559,
      ),
      width: 512,
      expected: false,
    },
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      lowResolutionCollectionId: 'LOW_RESOLUTION_COLLECTION_ID',
      lowResolutionMetersPerPixelThreshold: 300,
      bbox: new BBox(
        CRS_EPSG3857,
        -15028131.257091936,
        2504688.542848655,
        -12523442.714243278,
        5009377.085697314,
      ),
      width: 512,
      expected: true,
    },
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      lowResolutionCollectionId: 'LOW_RESOLUTION_COLLECTION_ID',
      lowResolutionMetersPerPixelThreshold: 300,
      bbox: new BBox(
        CRS_EPSG3857,
        112.81332057952881,
        63.97041521013803,
        119.85694837570192,
        65.98227733565385,
      ),
      width: 512,
      expected: false,
    },
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      bbox: new BBox(
        CRS_EPSG3857,
        -15028131.257091936,
        2504688.542848655,
        -12523442.714243278,
        5009377.085697314,
      ),
      width: 512,
      expected: false,
    },
    {
      layerParams: {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        collectionId: 'mockCollectionId',
        subType: BYOCSubTypes.BYOC,
      },
      bbox: new BBox(
        CRS_EPSG3857,
        112.81332057952881,
        63.97041521013803,
        119.85694837570192,
        65.98227733565385,
      ),
      width: 512,
      expected: false,
    },
  ])(
    'shouldUseLowResolutionCollection %p',
    async ({
      layerParams,
      lowResolutionCollectionId,
      lowResolutionMetersPerPixelThreshold,
      bbox,
      width,
      expected,
    }) => {
      const layer = new BYOCLayer(layerParams);
      layer.lowResolutionCollectionId = lowResolutionCollectionId;
      layer.lowResolutionMetersPerPixelThreshold = lowResolutionMetersPerPixelThreshold;
      expect(layer.shouldUseLowResolutionCollection(bbox, width)).toBe(expected);
    },
  );
});
