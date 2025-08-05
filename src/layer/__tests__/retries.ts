import { setAuthToken, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { constructFixtureFindTilesCatalog } from './fixtures.S1GRDAWSLayer';
import { CACHE_CONFIG_30MIN } from '../../utils/cacheHandlers';
import { AUTH_TOKEN, mockNetwork } from './testUtils.findTiles';

beforeEach(async () => {
  await invalidateCaches();
  setAuthToken(AUTH_TOKEN);
});

test('Retries correctly on network errors', async () => {
  // we need to adjust jest timeout until we have support for setting the delay when retrying,
  // otherwise the test will time out:
  const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
    constructFixtureFindTilesCatalog({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

  expect(mockNetwork.history.post.length).toBe(3);
  expect(tiles).toStrictEqual(expectedResultTiles);
  expect(hasMore).toBe(expectedResultHasMore);
}, 7000);

test("Doesn't retry if not needed", async () => {
  const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
    constructFixtureFindTilesCatalog({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

  expect(mockNetwork.history.post.length).toBe(1);
  expect(tiles).toStrictEqual(expectedResultTiles);
  expect(hasMore).toBe(expectedResultHasMore);
});

test(
  'Fails if max. retries (default == 2) was exceeded',
  async () => {
    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesCatalog({});

    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);

    await expect(layer.findTiles(bbox, fromTime, toTime)).rejects.toThrow();

    expect(mockNetwork.history.post.length).toBe(3);
  },
  2 * 3000 + 1000,
);

test(
  'Fails if max. retries (explicitly set) was exceeded',
  async () => {
    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesCatalog({});

    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);

    await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: 3 })).rejects.toThrow();

    expect(mockNetwork.history.post.length).toBe(4);
  },
  3 * 3000 + 1000,
);

test("Doesn't retry if retrying is disabled", async () => {
  const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesCatalog({});
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);

  await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: 0 })).rejects.toThrow();
  expect(mockNetwork.history.post.length).toBe(1);
});

test(
  'Uses default number of retries (2) if null is set',
  async () => {
    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesCatalog({});
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);

    await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: null })).rejects.toThrow();
    expect(mockNetwork.history.post.length).toBe(3);
  },
  2 * 3000 + 1000,
);

test(
  'Retries correctly when caching is enabled',
  async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
      constructFixtureFindTilesCatalog({});

    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime, null, null, {
      retries: 3,
      cache: CACHE_CONFIG_30MIN,
    });

    expect(mockNetwork.history.post.length).toBe(3);
    expect(tiles).toStrictEqual(expectedResultTiles);
    expect(hasMore).toBe(expectedResultHasMore);

    const cachedResult = await layer.findTiles(bbox, fromTime, toTime, null, null, {
      retries: 2,
      cache: CACHE_CONFIG_30MIN,
    });
    //check if any new network request was made
    expect(mockNetwork.history.post.length).toBe(3);
    expect(cachedResult.tiles).toStrictEqual(expectedResultTiles);
  },
  10 * 3000 + 1000,
);

test(
  'Retries concurrent requests when caching is enabled',
  async () => {
    const { fromTime, toTime, bbox, layer, mockedResponse, expectedResultTiles, expectedResultHasMore } =
      constructFixtureFindTilesCatalog({});

    //first request will fail, all other will succeed
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().reply(200, mockedResponse);

    //create 3 identical requests
    const findTilesRequest = layer.findTiles(bbox, fromTime, toTime, null, null, {
      retries: 3,
      cache: CACHE_CONFIG_30MIN,
    });
    const requests = [findTilesRequest, findTilesRequest, findTilesRequest];

    const results: any[] = [];
    await Promise.all(
      requests.map(async (request) => {
        const result = await request;
        results.push(result);
      }),
    );

    // since caching is enabled, there should be only 2 "network" requests - one successful and one 500
    expect(mockNetwork.history.post.length).toBe(2);
    expect(results.length).toBe(3);
    results.forEach((result) => {
      expect(result.tiles).toStrictEqual(expectedResultTiles);
      expect(result.hasMore).toBe(expectedResultHasMore);
    });
  },
  10 * 3000 + 1000,
);

test(
  'Compare payload is the same on retry',
  async () => {
    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesCatalog({});
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(500);
    mockNetwork.onPost().replyOnce(500);

    await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: 1 })).rejects.toThrow();
    expect(mockNetwork.history.post.length).toBe(2);
    expect(mockNetwork.history.post[1].data).toBe(mockNetwork.history.post[0].data);
  },
  2 * 3000 + 1000,
);
