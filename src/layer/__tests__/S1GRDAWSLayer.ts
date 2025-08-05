import {
  BBox,
  CRS_EPSG4326,
  S1GRDAWSEULayer,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
  setAuthToken,
  MosaickingOrder,
} from '../../index';

import { constructFixtureFindTilesCatalog } from './fixtures.S1GRDAWSLayer';

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

test('timezone should NOT be UTC', () => {
  // We are testing correctness in case of local timezones, so it doesn't make sense to
  // run these tests in UTC timezone. Env var in package.json should take care of that, but we
  // check here just to be sure.
  expect(new Date().getTimezoneOffset()).not.toBe(0);
});

test('constructor with no mosaickingOrder parameter', () => {
  const layer = new S1GRDAWSEULayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });
  expect(layer.mosaickingOrder).toEqual(null);
});

test('constructor with mosaickingOrder parameter', () => {
  const layer = new S1GRDAWSEULayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    mosaickingOrder: MosaickingOrder.MOST_RECENT,
  });
  const expectedMosaickingOrder = MosaickingOrder.MOST_RECENT;
  expect(layer.mosaickingOrder).toEqual(expectedMosaickingOrder);
});

const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search';

const fromTime: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

const layerParamsArr: Record<string, any>[] = [
  ...Object.keys(AcquisitionMode).map((acquisitionMode) => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: acquisitionMode,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(Polarization).map((polarization) => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: polarization,
    resolution: Resolution.HIGH,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(Resolution).map((resolution) => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: resolution,
    orbitDirection: OrbitDirection.ASCENDING,
  })),
  ...Object.keys(OrbitDirection).map((orbitDirection) => ({
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    orbitDirection: orbitDirection,
  })),
];

describe('Test findTiles using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('Catalog is used if token is set', async () => {
    await checkIfCorrectEndpointIsUsed(AUTH_TOKEN, constructFixtureFindTilesCatalog({}), CATALOG_URL);
  });

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
    const fixtures = constructFixtureFindTilesCatalog(layerParams);
    await checkRequestFindTiles(fixtures);
  });

  test('response from catalog', async () => {
    await checkResponseFindTiles(constructFixtureFindTilesCatalog({}));
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

  test.each(layerParamsArr)('check if correct request is constructed', async (layerParams) => {
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
