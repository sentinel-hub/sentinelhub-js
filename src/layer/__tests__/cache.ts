import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { constructFixtureFindTiles } from './fixtures.findTiles';
import { constructFixtureGetMap } from './fixtures.getMap';
import { ApiType } from 'src';
import { setAuthToken } from 'src/auth';
import { invalidateCaches, memoryCache, CacheTarget, CACHE_API_KEY } from 'src/utils/Cache';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

describe('Testing caching', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv(), fetch);
    jest.resetModules();
  });

  it('should fetch a request and cache it, where 2nd request is served from the cache', async () => {
    const {
      fromTime,
      toTime,
      bbox,
      layer,
      mockedResponse,
      expectedResultTiles,
      expectedResultHasMore,
    } = constructFixtureFindTiles({});
    const requestsConfig = {
      cache: {
        expiresIn: 60,
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.hasMore).toBe(expectedResultHasMore);
    expect(fromCacheResponse).toStrictEqual(responseFromMockNetwork);
  });

  it('should make a 2nd request after the cache has expired', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    const requestsConfig = {
      cache: {
        expiresIn: 1,
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    await new Promise(r => setTimeout(r, 1100));
    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(2);
  });

  it('test that no responses are cached', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime);
    await layer.findTiles(bbox, fromTime, toTime);

    expect(mockNetwork.history.post.length).toBe(2);
  });

  it('test that getMap caching is enabled by default', async () => {
    // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
    window.Blob = undefined;
    const { layer, getMapParams, mockedResponse } = constructFixtureGetMap();
    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.getMap(getMapParams, ApiType.PROCESSING);
    await layer.getMap(getMapParams, ApiType.PROCESSING);

    expect(mockNetwork.history.post.length).toBe(1);
  });

  it('test disabling default cache', async () => {
    // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
    window.Blob = undefined;
    const { layer, getMapParams, mockedResponse } = constructFixtureGetMap();
    const requestsConfig = {
      cache: {
        expiresIn: 0,
      },
    };

    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().reply(mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(2);
  });
});

describe('Testing cache targets', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv(), fetch);
    jest.resetModules();
    memoryCache.clear();
  });

  it('should cache to cache api', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles } = constructFixtureFindTiles(
      {},
    );
    const requestsConfig = {
      cache: {
        expiresIn: 60,
        targets: [CacheTarget.CACHE_API],
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    invalidateCaches([CacheTarget.CACHE_API]);

    const afterMemCacheInvalidated = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );

    expect(mockNetwork.history.post.length).toBe(2);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(afterMemCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should cache to memory', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles } = constructFixtureFindTiles(
      {},
    );
    const requestsConfig = {
      cache: {
        expiresIn: 60,
        targets: [CacheTarget.MEMORY],
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    invalidateCaches([CacheTarget.MEMORY]);
    const afterMemCacheInvalidated = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );

    expect(mockNetwork.history.post.length).toBe(2);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(afterMemCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should default to caching to cache_api', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles } = constructFixtureFindTiles(
      {},
    );
    const requestsConfig = {
      cache: {
        expiresIn: 60,
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    invalidateCaches([CacheTarget.CACHE_API]);

    const afterMemCacheInvalidated = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );

    expect(mockNetwork.history.post.length).toBe(2);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(afterMemCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should invalidate caches', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    const reqConfigCacheApi = {
      cache: {
        expiresIn: 1,
        targets: [CacheTarget.CACHE_API],
      },
    };

    const reqConfigMemory = {
      cache: {
        expiresIn: 1,
        targets: [CacheTarget.MEMORY],
      },
    };

    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigCacheApi);
    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigCacheApi);
    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigMemory);
    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigMemory);
    expect(mockNetwork.history.post.length).toBe(2);

    await invalidateCaches();

    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigCacheApi);
    await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigMemory);
    expect(mockNetwork.history.post.length).toBe(4);
  });
});

describe('Testing cache targets when cache_api is not available', () => {
  beforeEach(() => {
    Object.assign(global, { caches: undefined }, fetch);
    jest.resetModules();
    memoryCache.clear();
  });

  it('should default to memory if window.caches is undefined', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles } = constructFixtureFindTiles(
      {},
    );
    const requestsConfig = {
      cache: {
        expiresIn: 60,
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    invalidateCaches([CacheTarget.MEMORY]);

    const afterMemCacheInvalidated = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );

    expect(mockNetwork.history.post.length).toBe(2);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(afterMemCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });
});
