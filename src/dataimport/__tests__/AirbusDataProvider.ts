import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches, BBox, CRS_EPSG4326 } from '../../index';
import { TPDI } from '../TPDI';
import { AirbusDataProvider } from '../AirbusDataProvider';

import '../../../jest-setup';
import { AirbusConstellation, AirbusProcessingLevel, TPDISearchParams, TPDProvider } from '../const';
import { Polygon } from '@turf/helpers';
import { checkSearchPayload } from './testUtils.AirbusDataProvider';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

const defaultSearchParams: TPDISearchParams = {
  fromTime: new Date(2021, 5 - 1, 30, 0, 0, 0, 0),
  toTime: new Date(2021, 6 - 1, 31, 23, 59, 59, 999),
  bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
  constellation: AirbusConstellation.SPOT,
};

const defaultGeometry: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [15.825815, 46.714048],
      [15.813988, 46.707248],
      [15.832682, 46.703062],
      [15.839931, 46.711694],
      [15.835353, 46.716664],
      [15.825815, 46.714048],
    ],
  ],
};

describe('Test search', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
  });

  it('requires authenthication', async () => {
    setAuthToken(undefined);
    try {
      await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams);
    } catch (e) {
      expect(e.message).toEqual('Must be authenticated to perform request');
    }

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams);
    expect(mockNetwork.history.post.length).toBe(1);
  });

  it.each([
    ['bbox', 'Parameter bbox and/or geometry must be specified'],
    ['fromTime', 'Parameter fromTime must be specified'],
    ['toTime', 'Parameter toTime must be specified'],
    ['constellation', 'Parameter constellation must be specified'],
  ])('throws an error when required parameter is missing', async (property, errorMessage) => {
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams);
    const params: { [attr: string]: any } = { ...defaultSearchParams };
    const key: any = Object.keys(defaultSearchParams).find(k => k === property);
    delete params[key];
    await expect(TPDI.search(TPDProvider.AIRBUS, params as TPDISearchParams)).rejects.toThrow(
      new Error(errorMessage),
    );
  });

  it('throws an error when crs is not set', async () => {
    const params: TPDISearchParams = { ...defaultSearchParams, geometry: defaultGeometry };

    await expect(TPDI.search(TPDProvider.AIRBUS, params)).rejects.toThrow(
      new Error('Parameter crs must be specified'),
    );
    params.crs = CRS_EPSG4326;
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.AIRBUS, params);
  });

  it.each([
    [{ ...defaultSearchParams }],
    [{ ...defaultSearchParams, geometry: defaultGeometry, crs: CRS_EPSG4326 }],
    [
      {
        ...defaultSearchParams,
        maxCloudCoverage: 10,
        processingLevel: AirbusProcessingLevel.ALBUM,
        maxSnowCoverage: 20,
        maxIncidenceAngle: 30,
      },
    ],
    [{ ...defaultSearchParams, expiredFromTime: new Date() }],
    [{ ...defaultSearchParams, expiredToTime: new Date() }],
    [{ ...defaultSearchParams, expiredFromTime: new Date(), expiredToTime: new Date() }],
    [{ ...defaultSearchParams, maxCloudCoverage: null }],
    [{ ...defaultSearchParams, processingLevel: null }],
    [{ ...defaultSearchParams, maxSnowCoverage: null }],
    [{ ...defaultSearchParams, maxIncidenceAngle: null }],
    [{ ...defaultSearchParams, maxCloudCoverage: undefined }],
    [{ ...defaultSearchParams, processingLevel: undefined }],
    [{ ...defaultSearchParams, maxSnowCoverage: undefined }],
    [{ ...defaultSearchParams, maxIncidenceAngle: undefined }],
    [{ ...defaultSearchParams, maxCloudCoverage: 0 }],
    [{ ...defaultSearchParams, maxSnowCoverage: 0 }],
    [{ ...defaultSearchParams, maxIncidenceAngle: 0 }],
  ])('checks if parameters are set correctly', async params => {
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.AIRBUS, params);
    expect(mockNetwork.history.post.length).toBe(1);
    const { data } = mockNetwork.history.post[0];
    const requestData = JSON.parse(data);
    checkSearchPayload(requestData, params);
  });
});

describe('Test create order payload', () => {
  it.each([
    ['name', 'collectionId', ['id'], { ...defaultSearchParams }],
    [
      'name',
      'collectionId',
      ['id'],
      {
        ...defaultSearchParams,
        maxCloudCoverage: 10,
        processingLevel: AirbusProcessingLevel.ALBUM,
        maxSnowCoverage: 20,
        maxIncidenceAngle: 30,
      },
    ],

    ['name', 'collectionId', null, { ...defaultSearchParams }],
    ['name', 'collectionId', [], { ...defaultSearchParams }],
    ['name', null, null, { ...defaultSearchParams }],
    [null, null, null, { ...defaultSearchParams }],
  ])('checks if parameters are set correctly', async (name, collectionId, items, params) => {
    const tpdp = new AirbusDataProvider();
    const payload = tpdp.getOrderPayload(name, collectionId, items, params);

    if (!!name) {
      expect(payload.name).toBeDefined();
      expect(payload.name).toStrictEqual(name);
    } else {
      expect(payload.name).toBeUndefined();
    }

    if (!!collectionId) {
      expect(payload.collectionId).toBeDefined();
      expect(payload.collectionId).toStrictEqual(collectionId);
    } else {
      expect(payload.collectionId).toBeUndefined();
    }

    const { input } = payload;

    const dataObject = input.data[0];
    const { products } = dataObject;

    if (!!items && items.length) {
      expect(products).toBeDefined();
      expect(dataObject.products.length).toStrictEqual(items.length);
      expect(dataObject.dataFilter).toBeUndefined();
    } else {
      expect(products).toBeUndefined();
      checkSearchPayload(input, params);
    }
  });
});
