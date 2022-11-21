import {
  BBox,
  CRS_EPSG4326,
  S1GRDAWSEULayer,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
  LinkType,
  setAuthToken,
  BackscatterCoeff,
} from '../../index';

import {
  constructFixtureFindTilesSearchIndex,
  constructFixtureFindTilesCatalog,
} from './fixtures.S1GRDAWSLayer';

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
import { DATASET_AWSEU_S1GRD } from '../dataset';
import { DEMInstanceTypeOrthorectification, MosaickingOrder } from '../const';
import { SpeckleFilterType } from '../S1GRDAWSEULayer';

test('timezone should NOT be UTC', () => {
  // We are testing correctness in case of local timezones, so it doesn't make sense to
  // run these tests in UTC timezone. Env var in package.json should take care of that, but we
  // check here just to be sure.
  expect(new Date().getTimezoneOffset()).not.toBe(0);
});

test.each([
  [true, '2018-11-28T11:12:13Z', new Date(Date.UTC(2018, 11 - 1, 28, 11, 12, 13))],
  [false, '2018-11-28T11:12:13Z', new Date(Date.UTC(2018, 11 - 1, 28, 11, 12, 13))],
  [false, '2018-11-11T00:01:02Z', new Date(Date.UTC(2018, 11 - 1, 11, 0, 1, 2))],
])(
  'S1GRDLayer.findTiles returns correct data (%p, %p, %p)',
  async (hasMoreFixture, sensingTimeFixture, expectedSensingTimeFixture) => {
    const fromTime = new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0));
    const toTime = new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59));
    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    });

    // mock a single-tile response:
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, {
      tiles: [
        {
          type: 'S1',
          id: 1293846,
          originalId: 'S1A_EW_GRDM_1SDH_20200202T180532_20200202T180632_031077_03921C_E6C8',
          dataUri:
            's3://sentinel-s1-l1c/GRD/2020/2/2/EW/DH/S1A_EW_GRDM_1SDH_20200202T180532_20200202T180632_031077_03921C_E6C8',
          dataGeometry: {
            type: 'MultiPolygon',
            crs: {
              type: 'name',
              properties: {
                name: 'urn:ogc:def:crs:EPSG::4326',
              },
            },
            coordinates: [
              [
                [
                  [-28.958387727765576, 77.22089053106154],
                  [-28.454271377131395, 77.28385150034897],
                  [-27.718918346651687, 77.37243188785827],
                  [-26.974008583323926, 77.45890918854761],
                  [-26.217031402559755, 77.54352656462356],
                  [-25.447186512415197, 77.62630504330521],
                  [-24.667542862300945, 77.7068623880844],
                  [-28.958387727765576, 77.22089053106154],
                ],
              ],
            ],
          },
          sensingTime: sensingTimeFixture,
          rasterWidth: 10459,
          rasterHeight: 9992,
          polarization: 'DV',
          resolution: 'HIGH',
          orbitDirection: 'ASCENDING',
          acquisitionMode: 'IW',
          timeliness: 'NRT3h',
          additionalData: {},
          missionDatatakeId: 234012,
          sliceNumber: 5,
        },
      ],
      hasMore: hasMoreFixture,
      maxOrderKey: '2020-02-02T08:17:57Z;1295159',
    });

    const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime, 5, 0);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(hasMore).toBe(hasMoreFixture);
    expect(tiles).toStrictEqual([
      {
        geometry: {
          type: 'MultiPolygon',
          crs: {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:EPSG::4326',
            },
          },
          coordinates: [
            [
              [
                [-28.958387727765576, 77.22089053106154],
                [-28.454271377131395, 77.28385150034897],
                [-27.718918346651687, 77.37243188785827],
                [-26.974008583323926, 77.45890918854761],
                [-26.217031402559755, 77.54352656462356],
                [-25.447186512415197, 77.62630504330521],
                [-24.667542862300945, 77.7068623880844],
                [-28.958387727765576, 77.22089053106154],
              ],
            ],
          ],
        },
        sensingTime: expectedSensingTimeFixture,
        meta: {
          acquisitionMode: AcquisitionMode.IW,
          polarization: Polarization.DV,
          resolution: Resolution.HIGH,
          orbitDirection: OrbitDirection.ASCENDING,
          tileId: 1293846,
        },
        links: [
          {
            target:
              's3://sentinel-s1-l1c/GRD/2020/2/2/EW/DH/S1A_EW_GRDM_1SDH_20200202T180532_20200202T180632_031077_03921C_E6C8',
            type: LinkType.AWS,
          },
        ],
      },
    ]);
  },
);

const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search';
const SEARCH_INDEX_URL = 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex';

const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

const layerParamsArr: Record<string, any>[] = [
  ...Object.keys(AcquisitionMode).map(acquisitionMode => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: acquisitionMode,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(Polarization).map(polarization => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: polarization,
    resolution: Resolution.HIGH,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(Resolution).map(resolution => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: resolution,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(OrbitDirection).map(orbitDirection => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    orbitDirection: orbitDirection,
  })),
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
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      null,
      constructFixtureFindDatesUTCSearchIndex(layer, {}),
      DATASET_AWSEU_S1GRD.findDatesUTCUrl,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    let constructorParams: Record<string, any> = {};

    if (layerParams && layerParams.acquisitionMode) {
      constructorParams.acquisitionMode = layerParams.acquisitionMode;
    }

    if (layerParams && layerParams.orbitDirection) {
      constructorParams.orbitDirection = layerParams.orbitDirection;
    }

    if (layerParams && layerParams.polarization) {
      constructorParams.polarization = layerParams.polarization;
    }

    if (layerParams && layerParams.resolution) {
      constructorParams.resolution = layerParams.resolution;
    }

    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCSearchIndex(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
      orbitDirection: OrbitDirection.ASCENDING,
    });
    await checkResponseFindDatesUTC(
      constructFixtureFindDatesUTCSearchIndex(layer, {
        acquisitionMode: AcquisitionMode.IW,
        polarization: Polarization.DV,
        resolution: Resolution.HIGH,
        orbitDirection: OrbitDirection.ASCENDING,
      }),
    );
  });
});
describe('Test findDatesUTC using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('catalog is used if token is set', async () => {
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
    });
    await checkIfCorrectEndpointIsUsedFindDatesUTC(
      AUTH_TOKEN,
      constructFixtureFindDatesUTCCatalog(layer, {}),
      CATALOG_URL,
    );
  });

  test.each(layerParamsArr)('check if correct request is constructed', async layerParams => {
    let constructorParams: Record<string, any> = {};

    if (layerParams && layerParams.acquisitionMode) {
      constructorParams.acquisitionMode = layerParams.acquisitionMode;
    }

    if (layerParams && layerParams.orbitDirection) {
      constructorParams.orbitDirection = layerParams.orbitDirection;
    }

    if (layerParams && layerParams.polarization) {
      constructorParams.polarization = layerParams.polarization;
    }

    if (layerParams && layerParams.resolution) {
      constructorParams.resolution = layerParams.resolution;
    }

    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      ...constructorParams,
    });
    const fixtures = constructFixtureFindDatesUTCCatalog(layer, layerParams);
    await checkRequestFindDatesUTC(fixtures);
  });

  test('response from service', async () => {
    const layer = new S1GRDAWSEULayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
      orbitDirection: OrbitDirection.ASCENDING,
    });
    await checkResponseFindDatesUTC(
      constructFixtureFindDatesUTCCatalog(layer, {
        acquisitionMode: AcquisitionMode.IW,
        polarization: Polarization.DV,
        resolution: Resolution.HIGH,
        orbitDirection: OrbitDirection.ASCENDING,
      }),
    );
  });
});

describe('test constructor', () => {
  test('params are set correctly', async () => {
    const defaultValues = {
      instanceId: 'instanceId',
      layerId: 'layerId',
      evalscript: '//evalscript',
      evalscriptUrl: 'evalscriptUrl',
      dataProduct: 'dataProduct',
      title: 'title',
      description: 'description',
      legendUrl: 'legendUrl',
      acquisitionMode: AcquisitionMode.EW,
      polarization: Polarization.SV,
      resolution: Resolution.MEDIUM,
      orthorectify: true,
      demInstanceType: DEMInstanceTypeOrthorectification.COPERNICUS_90,
      backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
      orbitDirection: OrbitDirection.DESCENDING,
      speckleFilter: {
        type: SpeckleFilterType.LEE,
        windowSizeX: 5,
        windowSizeY: 5,
      },
      mosaickingOrder: MosaickingOrder.LEAST_RECENT,
    };

    const layer = new S1GRDAWSEULayer(defaultValues);
    Object.keys(defaultValues).forEach(key => {
      const expectedValue = (defaultValues as any)[key];
      const value = (layer as any)[key];
      expect(value).toStrictEqual(expectedValue);
    });
  });
});
