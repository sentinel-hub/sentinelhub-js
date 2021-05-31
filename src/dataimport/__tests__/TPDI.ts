import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches } from '../../index';
import { TPDI } from '../TPDI';

import '../../../jest-setup';
import { TPDICollections } from '../const';
import { CACHE_CONFIG_NOCACHE } from '../../utils/cacheHandlers';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

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
      expect(e.message).toEqual('Must be authenticated to fetch quotas');
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
      TPDI.getQuota(TPDICollections.AIRBUS_PLEIADES, { cache: CACHE_CONFIG_NOCACHE });
    } catch (e) {
      expect(e.message).toEqual('Must be authenticated to fetch quotas');
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
