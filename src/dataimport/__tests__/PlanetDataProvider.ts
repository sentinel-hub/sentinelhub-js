import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches, BBox, CRS_EPSG4326 } from '../../index';
import { TPDI } from '../TPDI';

import '../../../jest-setup';
import {
  PlanetProductBundle,
  PlanetScopeHarmonization,
  TPDIOrderParams,
  TPDISearchParams,
  TPDProvider,
} from '../const';
import { Polygon } from '@turf/helpers';
import { checkSearchPayload } from './testUtils.PlanetDataProvider';
import { PlanetDataProvider } from '../PlanetDataProvider';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

const defaultSearchParams: TPDISearchParams = {
  fromTime: new Date(2021, 5 - 1, 30, 0, 0, 0, 0),
  toTime: new Date(2021, 6 - 1, 31, 23, 59, 59, 999),
  bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
};

const defaultOrderParams: TPDIOrderParams = {
  planetApiKey: 'PLANET_API_KEY',
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
      await TPDI.search(TPDProvider.PLANET, defaultSearchParams);
    } catch (e) {
      expect(e.message).toEqual('Must be authenticated to perform request');
    }

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.search(TPDProvider.PLANET, defaultSearchParams);
    expect(mockNetwork.history.post.length).toBe(1);
  });

  it.each([
    ['bbox', 'Parameter bbox and/or geometry must be specified'],
    ['fromTime', 'Parameter fromTime must be specified'],
    ['toTime', 'Parameter toTime must be specified'],
  ])('throws an error when required parameter is missing', async (property, errorMessage) => {
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.PLANET, defaultSearchParams);
    const params: { [attr: string]: any } = { ...defaultSearchParams };
    const key: any = Object.keys(defaultSearchParams).find(k => k === property);
    delete params[key];
    await expect(TPDI.search(TPDProvider.PLANET, params as TPDISearchParams)).rejects.toThrow(
      new Error(errorMessage),
    );
  });

  it('throws an error when crs is not set', async () => {
    const params: TPDISearchParams = { ...defaultSearchParams, geometry: defaultGeometry };

    await expect(TPDI.search(TPDProvider.PLANET, params)).rejects.toThrow(
      new Error('Parameter crs must be specified'),
    );
    params.crs = CRS_EPSG4326;
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.PLANET, params);
  });

  it.each([
    [{ ...defaultSearchParams }],
    [{ ...defaultSearchParams, geometry: defaultGeometry, crs: CRS_EPSG4326 }],
    [
      {
        ...defaultSearchParams,
        maxCloudCoverage: 10,
        productBundle: PlanetProductBundle.ANALYTIC,
        nativeFilter: { id: 1 },
      },
    ],
    [{ ...defaultSearchParams, maxCloudCoverage: null }],
    [{ ...defaultSearchParams, maxCloudCoverage: undefined }],
    [{ ...defaultSearchParams, nativeFilter: undefined }],
    [{ ...defaultSearchParams, productBundle: undefined }],
  ])('checks if parameters are set correctly', async params => {
    mockNetwork.onPost().reply(200);
    await TPDI.search(TPDProvider.PLANET, params);
    expect(mockNetwork.history.post.length).toBe(1);
    const { data } = mockNetwork.history.post[0];
    const requestData = JSON.parse(data);

    checkSearchPayload(requestData, params);
  });
});

describe('Test create order payload', () => {
  it.each([
    ['name', 'collectionId', ['id'], { ...defaultSearchParams }, { ...defaultOrderParams }],
    [
      'name',
      'collectionId',
      ['id'],
      {
        ...defaultSearchParams,
        maxCloudCoverage: 10,
        productBundle: PlanetProductBundle.ANALYTIC,
        nativeFilter: { id: 1 },
      },
      { ...defaultOrderParams },
    ],
    [
      'name',
      'collectionId',
      ['id'],
      { ...defaultSearchParams },
      { ...defaultOrderParams, harmonizeTo: PlanetScopeHarmonization.NONE },
    ],

    ['name', 'collectionId', null, { ...defaultSearchParams }, { ...defaultOrderParams }],
    ['name', 'collectionId', [], { ...defaultSearchParams }, { ...defaultOrderParams }],
    ['name', null, null, { ...defaultSearchParams }, { ...defaultOrderParams }],
    [null, null, null, { ...defaultSearchParams }, { ...defaultOrderParams }],
    ['name', 'collectionId', ['id'], { ...defaultSearchParams }, {}],
    ['name', 'collectionId', ['id'], { ...defaultSearchParams }, null],
  ])(
    'checks if parameters are set correctly',
    async (name, collectionId, items, searchParams, orderParams) => {
      const tpdp = new PlanetDataProvider();
      const payload = tpdp.getOrderPayload(name, collectionId, items, searchParams, orderParams);

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

      if (orderParams?.planetApiKey) {
        expect(input.planetApiKey).toEqual(orderParams.planetApiKey);
      } else {
        expect(input.planetApiKey).toBeUndefined();
      }

      const dataObject = input.data[0];
      const { itemIds } = dataObject;

      if (orderParams?.harmonizeTo) {
        expect(dataObject.harmonizeTo).toEqual(orderParams.harmonizeTo);
      } else {
        expect(dataObject.harmonizeTo).toBeUndefined();
      }

      if (!!items && items.length) {
        expect(itemIds).toBeDefined();
        expect(itemIds.length).toStrictEqual(items.length);
        expect(itemIds).toStrictEqual(items);
        expect(dataObject.dataFilter).toBeUndefined();
      } else {
        expect(itemIds).toBeUndefined();
        checkSearchPayload(input, searchParams);
      }
    },
  );
});
