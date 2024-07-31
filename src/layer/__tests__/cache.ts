/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { ApiType, setAuthToken, invalidateCaches, CacheTarget } from '../../index';
import { cacheStillValid, EXPIRY_HEADER_KEY } from '../../utils/cacheHandlers';

import '../../../jest-setup';
import { constructFixtureFindTiles } from './fixtures.findTiles';
import { constructFixtureGetMap } from './fixtures.getMap';
import { constructFixtureUpdateLayerFromServiceIfNeeded } from './fixtures.BYOCLayer';

const mockNetwork = new MockAdapter(axios);

const EXAMPLE_TOKEN = 'TOKEN111';

describe('Testing caching', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  it('should fetch a request and cache it, where 2nd request is served from the cache', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
      constructFixtureFindTiles({});
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
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
      constructFixtureFindTiles({});
    const requestsConfig = {
      cache: {
        expiresIn: 1,
      },
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1);

    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1); // no network request - cache was used
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.hasMore).toBe(expectedResultHasMore);
    expect(fromCacheResponse).toStrictEqual(responseFromMockNetwork);

    await new Promise((r) => setTimeout(r, 1100));

    const responseFromMockNetwork2 = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );
    expect(mockNetwork.history.post.length).toBe(2);

    const fromCacheResponse2 = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(2); // no network request - cache was used
    expect(fromCacheResponse2.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse2.hasMore).toBe(expectedResultHasMore);
    expect(fromCacheResponse2).toStrictEqual(responseFromMockNetwork2);
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

  it('test that a 2nd request is made after cache expires', async () => {
    // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
    window.Blob = undefined;
    const requestsConfig = {
      cache: {
        expiresIn: 1,
      },
    };
    const { layer, getMapParams, mockedResponse } = constructFixtureGetMap();
    setAuthToken(EXAMPLE_TOKEN);
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1);

    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1); // no network request - cache was used

    await new Promise((r) => setTimeout(r, 1100));

    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(2);

    await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(2); // no network request - cache was used
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
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
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
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

    invalidateCaches([CacheTarget.CACHE_API]);

    const afterCacheInvalidated = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(2);
    expect(afterCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
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
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

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
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

    invalidateCaches([CacheTarget.CACHE_API]);

    const afterCacheInvalidated = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(2);
    expect(afterCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should invalidate caches', async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles } = constructFixtureFindTiles(
      {},
    );
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

    const responseFromMockNetwork1 = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      reqConfigCacheApi,
    );
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigCacheApi);
    expect(responseFromMockNetwork1.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

    const responseFromMockNetwork2 = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      reqConfigMemory,
    );
    const fromMemCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, reqConfigMemory);
    expect(responseFromMockNetwork2.tiles).toStrictEqual(expectedResultTiles);
    expect(fromMemCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(mockNetwork.history.post.length).toBe(2);

    await invalidateCaches();

    const shouldNotBeCachedFromCacheApi = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      reqConfigCacheApi,
    );
    const shouldNotBeCachedFromMem = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      reqConfigMemory,
    );
    expect(mockNetwork.history.post.length).toBe(4);
    expect(shouldNotBeCachedFromCacheApi.tiles).toStrictEqual(expectedResultTiles);
    expect(shouldNotBeCachedFromMem.tiles).toStrictEqual(expectedResultTiles);
  });
});

describe('Testing cache targets when cache_api is not available', () => {
  beforeEach(async () => {
    Object.assign(global, { caches: undefined }, fetch); // adds these functions to the global object and removes caches from global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  it('should default to memory if window.caches is undefined and no targets were defined', async () => {
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
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

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
    expect(afterMemCacheInvalidated.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should not use cache if cache-api is specified as target', async () => {
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
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const shouldNotBeCachedResponse = await layer.findTiles(
      bbox,
      fromTime,
      toTime,
      null,
      null,
      requestsConfig,
    );

    expect(mockNetwork.history.post.length).toBe(2);
    expect(shouldNotBeCachedResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
  });
});

// reading from a Response body twice can throw an error
describe('Reading from cache twice', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object and removes caches from global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  it('should read from cache-api twice', async () => {
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
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

    const fromCacheResponse2 = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(fromCacheResponse2.tiles).toStrictEqual(expectedResultTiles);
  });

  it('should read from memory cache twice', async () => {
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
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    expect(mockNetwork.history.post.length).toBe(1);
    expect(responseFromMockNetwork.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);

    const fromCacheResponse2 = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(fromCacheResponse2.tiles).toStrictEqual(expectedResultTiles);
  });
});

describe('Unit test for cacheStillValid', () => {
  it('It should be valid', async () => {
    const header = {
      [EXPIRY_HEADER_KEY]: new Date().getTime() + 100,
    };
    const isValid = cacheStillValid(header);
    expect(isValid).toBeTruthy();
  });

  it('It should be invalid', async () => {
    const header = {
      [EXPIRY_HEADER_KEY]: new Date().getTime() - 100,
    };
    const isValid = cacheStillValid(header);
    expect(isValid).toBeFalsy();
  });
});

describe('Unit test for aux request caching', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
  });

  const listOfRequstConfigs = [
    {},
    null,
    undefined,
    { retries: 1 },
    {
      cache: {
        expiresIn: 60,
      },
    },
    {
      cache: {
        targets: [CacheTarget.CACHE_API],
        expiresIn: 60,
      },
    },
    {
      cache: {
        targets: null,
        expiresIn: 60,
      },
    },
    {
      cache: {
        targets: [],
        expiresIn: 60,
      },
    },
    {
      cache: {
        targets: [],
        expiresIn: null,
      },
    },
  ];
  it.each([...listOfRequstConfigs])(
    'It should be cache aux request to memory by default',
    async (requestConfig) => {
      setAuthToken(EXAMPLE_TOKEN);
      const { layer, mockedResponse, expectedLayerParams } = constructFixtureUpdateLayerFromServiceIfNeeded(
        {},
      );
      mockNetwork.reset();
      mockNetwork.onGet().replyOnce(200, mockedResponse);
      mockNetwork.onGet().replyOnce(200, mockedResponse);
      mockNetwork.onGet().replyOnce(200, mockedResponse);

      const responseFromMockNetwork = await layer.fetchLayerParamsFromSHServiceV3(requestConfig);
      const fromCacheResponse = await layer.fetchLayerParamsFromSHServiceV3(requestConfig);
      expect(mockNetwork.history.get.length).toBe(1);
      expect(responseFromMockNetwork).toStrictEqual(expectedLayerParams);
      expect(fromCacheResponse).toStrictEqual(expectedLayerParams);

      invalidateCaches([CacheTarget.MEMORY]);

      const afterMemCacheInvalidated = await layer.fetchLayerParamsFromSHServiceV3(requestConfig);
      expect(mockNetwork.history.get.length).toBe(2);
      expect(afterMemCacheInvalidated).toStrictEqual(expectedLayerParams);
    },
  );
  it('It should not cache aux request when cache is disabled', async () => {
    setAuthToken(EXAMPLE_TOKEN);
    const { layer, mockedResponse, expectedLayerParams } = constructFixtureUpdateLayerFromServiceIfNeeded({});
    const requestsConfig = {
      cache: {
        expiresIn: 0,
      },
    };

    mockNetwork.reset();
    mockNetwork.onGet().replyOnce(200, mockedResponse);
    mockNetwork.onGet().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.fetchLayerParamsFromSHServiceV3(requestsConfig);
    const fromCacheResponse = await layer.fetchLayerParamsFromSHServiceV3(requestsConfig);
    expect(mockNetwork.history.get.length).toBe(2);
    expect(responseFromMockNetwork).toStrictEqual(expectedLayerParams);
    expect(fromCacheResponse).toStrictEqual(expectedLayerParams);
  });
});
