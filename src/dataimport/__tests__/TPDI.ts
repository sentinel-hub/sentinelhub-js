import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches, CRS_EPSG4326, BBox } from '../../index';
import { TPDI } from '../TPDI';

import '../../../jest-setup';
import { AirbusConstellation, TPDICollections, TPDISearchParams, TPDProvider } from '../const';
import { CACHE_CONFIG_NOCACHE } from '../../utils/cacheHandlers';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

const defaultSearchParams: TPDISearchParams = {
  fromTime: new Date(2021, 5 - 1, 30, 0, 0, 0, 0),
  toTime: new Date(2021, 6 - 1, 31, 23, 59, 59, 999),
  bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
};

describe('Test getQuotas', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  it('requires authenthication', async () => {
    setAuthToken(undefined);
    try {
      await TPDI.getQuotas({});
    } catch (e) {
      expect(e.message).toEqual('Must be authenticated to perform request');
    }

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200, []);
    const res = await TPDI.getQuotas({});
    expect(mockNetwork.history.get.length).toBe(1);
    expect(res).toStrictEqual([]);
  });
});

describe('Test getQuota', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  it('requires authenthication', async () => {
    setAuthToken(undefined);
    try {
      await TPDI.getQuota(TPDICollections.AIRBUS_PLEIADES, { cache: CACHE_CONFIG_NOCACHE });
    } catch (e) {
      expect(e.message).toEqual('Must be authenticated to perform request');
    }

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200);
    await TPDI.getQuota(TPDICollections.AIRBUS_PLEIADES, { cache: CACHE_CONFIG_NOCACHE });
    expect(mockNetwork.history.get.length).toBe(1);
  });

  it('requires TDPICollectionId', async () => {
    setAuthToken(EXAMPLE_TOKEN);
    try {
      await TPDI.getQuota(null, {});
    } catch (e) {
      expect(e.message).toEqual('TDPICollectionId must be provided');
    }
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200, {});
    await TPDI.getQuota(TPDICollections.AIRBUS_PLEIADES);
    expect(mockNetwork.history.get.length).toBe(1);
    const { params } = mockNetwork.history.get[0];
    expect(params).toStrictEqual({ collectionId: TPDICollections.AIRBUS_PLEIADES });
  });
});

describe('Test createOrder', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(EXAMPLE_TOKEN);
  });

  it.each([
    [TPDProvider.AIRBUS, { ...defaultSearchParams, constellation: AirbusConstellation.SPOT }],
    [TPDProvider.PLANET, { ...defaultSearchParams, planetApiKey: 'planetApiKey' }],
    [TPDProvider.MAXAR, { ...defaultSearchParams }],
  ])('requires authenthication', async (provider, params) => {
    setAuthToken(undefined);

    await expect(TPDI.createOrder(provider, 'name', 'collectionId', null, params)).rejects.toThrow(
      new Error('Must be authenticated to perform request'),
    );

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.createOrder(provider, 'name', 'collectionId', null, params);
    expect(mockNetwork.history.post.length).toBe(1);
  });
});
