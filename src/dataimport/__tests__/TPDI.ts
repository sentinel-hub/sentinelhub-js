import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches, CRS_EPSG4326, BBox } from '../../index';
import { TPDI, TPDI_SERVICE_URL, setTPDIServiceBaseURL } from '../TPDI';

import '../../../jest-setup';
import {
  AirbusConstellation,
  TPDICollections,
  TPDISearchParams,
  TPDProvider,
  ResamplingKernel,
  PlanetItemType,
  PlanetProductBundle,
} from '../const';
import { CACHE_CONFIG_NOCACHE } from '../../utils/cacheHandlers';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

const defaultSearchParams: TPDISearchParams = {
  fromTime: new Date(2021, 5 - 1, 30, 0, 0, 0, 0),
  toTime: new Date(2021, 6 - 1, 31, 23, 59, 59, 999),
  bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
};

describe('Test TPDI service enpoints', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(EXAMPLE_TOKEN);
  });

  it('uses correct endpoint to get quotas', async () => {
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200, []);
    await TPDI.getQuotas({});
    expect(mockNetwork.history.get.length).toBe(1);
    const request = mockNetwork.history.get[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/accountquotas`);
  });

  it('uses correct endpoint to get orders', async () => {
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200);
    await TPDI.getOrders();
    expect(mockNetwork.history.get.length).toBe(1);
    const request = mockNetwork.history.get[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/orders`);
  });

  it('uses correct endpoint to create an order', async () => {
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.createOrder(
      TPDProvider.AIRBUS,
      'name',
      'collectionId',
      null,
      {
        ...defaultSearchParams,
        constellation: AirbusConstellation.SPOT,
      },
      null,
    );
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/orders`);
  });

  it('uses correct endpoint to create a subscription', async () => {
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.createSubscription(
      TPDProvider.PLANET,
      'name',
      'collectionId',
      null,
      {
        ...defaultSearchParams,
        itemType: PlanetItemType.PSScene4Band,
        productBundle: PlanetProductBundle.ANALYTIC,
      },
      { planetApiKey: 'planetApiKey' },
    );
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/subscriptions`);
  });

  it('uses correct endpoint to confirm an order', async () => {
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    const orderId = 'orderId';
    await TPDI.confirmOrder(orderId);
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/orders/${orderId}/confirm`);
  });

  it('uses correct endpoint to confirm a subscription', async () => {
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    const subscriptionId = 'subscriptionId';
    await TPDI.confirmSubscription(subscriptionId);
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/subscriptions/${subscriptionId}/confirm`);
  });

  it('uses correct endpoint to delete an order', async () => {
    mockNetwork.reset();
    mockNetwork.onDelete().replyOnce(200);
    const orderId = 'orderId';
    await TPDI.deleteOrder(orderId);
    expect(mockNetwork.history.delete.length).toBe(1);
    const request = mockNetwork.history.delete[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/orders/${orderId}`);
  });

  it('uses correct endpoint to delete a subscription', async () => {
    mockNetwork.reset();
    mockNetwork.onDelete().replyOnce(200);
    const subscriptionId = 'subscriptionId';
    await TPDI.deleteSubscription(subscriptionId);
    expect(mockNetwork.history.delete.length).toBe(1);
    const request = mockNetwork.history.delete[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/subscriptions/${subscriptionId}`);
  });

  it('uses correct endpoint for search', async () => {
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.search(TPDProvider.AIRBUS, {
      ...defaultSearchParams,
      constellation: AirbusConstellation.SPOT,
    });
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toBe(`${TPDI_SERVICE_URL}/search`);
  });
});

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
    mockNetwork.onGet().replyOnce(200, { data: [] });
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
    mockNetwork.onGet().replyOnce(200, { data: [] });
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
    mockNetwork.onGet().replyOnce(200, { data: [] });
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
    [TPDProvider.AIRBUS, { ...defaultSearchParams, constellation: AirbusConstellation.SPOT }, null],
    [
      TPDProvider.PLANET,
      {
        ...defaultSearchParams,
        itemType: PlanetItemType.PSScene4Band,
        productBundle: PlanetProductBundle.ANALYTIC,
      },
      { planetApiKey: 'planetApiKey' },
    ],
    [TPDProvider.MAXAR, { ...defaultSearchParams }, { productKernel: ResamplingKernel.CC }],
  ])('requires authenthication', async (provider, searchParams, orderParams) => {
    setAuthToken(undefined);

    await expect(
      TPDI.createOrder(provider, 'name', 'collectionId', null, searchParams, orderParams),
    ).rejects.toThrow(new Error('Must be authenticated to perform request'));

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.createOrder(provider, 'name', 'collectionId', null, searchParams, orderParams);
    expect(mockNetwork.history.post.length).toBe(1);
  });
});

describe('Test createSubscription', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch);
    await invalidateCaches();
    setAuthToken(EXAMPLE_TOKEN);
  });

  it('requires authenthication', async () => {
    setAuthToken(undefined);

    const provider = TPDProvider.PLANET;
    const searchParams = {
      ...defaultSearchParams,
      itemType: PlanetItemType.PSScene4Band,
      productBundle: PlanetProductBundle.ANALYTIC,
    };
    const subscriptionParams = { planetApiKey: 'planetApiKey' };

    await expect(
      TPDI.createSubscription(provider, 'name', 'collectionId', null, searchParams, subscriptionParams),
    ).rejects.toThrow(new Error('Must be authenticated to perform request'));

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);
    await TPDI.createSubscription(provider, 'name', 'collectionId', null, searchParams, subscriptionParams);
    expect(mockNetwork.history.post.length).toBe(1);
  });

  it.each([
    [
      TPDProvider.AIRBUS,
      { ...defaultSearchParams, constellation: AirbusConstellation.SPOT },
      null,
      'Subscriptions are not supported for selected provider',
    ],
    [
      TPDProvider.PLANET,
      {
        ...defaultSearchParams,
        itemType: PlanetItemType.PSScene4Band,
        productBundle: PlanetProductBundle.ANALYTIC,
      },
      { planetApiKey: 'planetApiKey' },
      null,
    ],
    [
      TPDProvider.PLANET,
      {
        ...defaultSearchParams,
        itemType: PlanetItemType.PSScene4Band,
        productBundle: PlanetProductBundle.ANALYTIC,
      },
      null,
      'Parameter planetApiKey must be specified',
    ],
    [
      TPDProvider.MAXAR,
      { ...defaultSearchParams },
      { productKernel: ResamplingKernel.CC },
      'Subscriptions are not supported for selected provider',
    ],
  ])('createSubscription', async (provider, searchParams, subscriptionParams, errorMessage) => {
    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200);

    if (errorMessage) {
      await expect(
        TPDI.createSubscription(provider, 'name', 'collectionId', null, searchParams, subscriptionParams),
      ).rejects.toThrow(new Error(errorMessage));
    } else {
      await TPDI.createSubscription(provider, 'name', 'collectionId', null, searchParams, subscriptionParams);
      expect(mockNetwork.history.post.length).toBe(1);
    }
  });
});

describe('Test getOrders', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(EXAMPLE_TOKEN);
  });

  it('requires authenthication', async () => {
    setAuthToken(undefined);
    await expect(TPDI.getOrders()).rejects.toThrow(new Error('Must be authenticated to perform request'));

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200);
    await TPDI.getOrders();
    expect(mockNetwork.history.get.length).toBe(1);
  });

  it.each([
    [null, null, null, {}],
    [{ status: 'CREATED' }, null, null, { status: 'CREATED' }],
    [{ collectionId: 'collectionId' }, null, null, { collectionId: 'collectionId' }],
    [{ search: 'search' }, null, null, { search: 'search' }],
    [
      { status: 'CREATED', collectionId: 'collectionId', search: 'search' },
      null,
      null,
      { status: 'CREATED', collectionId: 'collectionId', search: 'search' },
    ],
    [
      { status: 'CREATED', collectionId: 'collectionId', search: 'search' },
      5,
      null,
      { status: 'CREATED', collectionId: 'collectionId', search: 'search', count: 5 },
    ],
    [
      { status: 'CREATED', collectionId: 'collectionId', search: 'search' },
      5,
      'viewtoken',
      { status: 'CREATED', collectionId: 'collectionId', search: 'search', count: 5, viewtoken: 'viewtoken' },
    ],
    [undefined, undefined, undefined, {}],
    [{}, undefined, undefined, {}],
    [null, 0, null, { count: 0 }],
    [null, null, '', {}],
  ])('sets search params correctly', async (searchParams, count, token, expectedParams) => {
    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200);
    await TPDI.getOrders(searchParams, null, count, token);
    expect(mockNetwork.history.get.length).toBe(1);
    const getParams = mockNetwork.history.get[0].params;
    expect(getParams).toStrictEqual(expectedParams);
  });
});

describe('Test setting TPDI service URL', () => {
  it('should be set to default', async () => {
    expect(TPDI_SERVICE_URL).toBe('https://services.sentinel-hub.com/api/v1/dataimport');
  });

  it('should update TPDI service URL', async () => {
    setTPDIServiceBaseURL('https://custom.sentinel.service.com');
    expect(TPDI_SERVICE_URL).toBe('https://custom.sentinel.service.com/api/v1/dataimport');
  });
});
