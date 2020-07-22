import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { constructFixtureFindTiles } from './fixtures.findTiles';
import { invalidateCaches } from 'src/utils/Cache';

const mockNetwork = new MockAdapter(axios);

beforeEach(async () => {
  await invalidateCaches();
});

test('Retries correctly on network errors', async () => {
  // we need to adjust jest timeout until we have support for setting the delay when retrying,
  // otherwise the test will time out:
  jest.setTimeout(7000);
  const {
    fromTime,
    toTime,
    bbox,
    layer,
    mockedResponse,
    expectedResultTiles,
    expectedResultHasMore,
  } = constructFixtureFindTiles({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

  expect(mockNetwork.history.post.length).toBe(3);
  expect(tiles).toStrictEqual(expectedResultTiles);
  expect(hasMore).toBe(expectedResultHasMore);
});

test("Doesn't retry if not needed", async () => {
  const {
    fromTime,
    toTime,
    bbox,
    layer,
    mockedResponse,
    expectedResultTiles,
    expectedResultHasMore,
  } = constructFixtureFindTiles({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

  expect(mockNetwork.history.post.length).toBe(1);
  expect(tiles).toStrictEqual(expectedResultTiles);
  expect(hasMore).toBe(expectedResultHasMore);
});

test('Fails if max. retries (default == 2) was exceeded', async () => {
  jest.setTimeout(2 * 3000 + 1000);
  const { fromTime, toTime, bbox, layer } = constructFixtureFindTiles({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);

  await expect(layer.findTiles(bbox, fromTime, toTime)).rejects.toThrow();

  expect(mockNetwork.history.post.length).toBe(3);
});

test('Fails if max. retries (explicitly set) was exceeded', async () => {
  jest.setTimeout(3 * 3000 + 1000);
  const { fromTime, toTime, bbox, layer } = constructFixtureFindTiles({});

  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);

  await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: 3 })).rejects.toThrow();

  expect(mockNetwork.history.post.length).toBe(4);
});

test("Doesn't retry if retrying is disabled", async () => {
  const { fromTime, toTime, bbox, layer } = constructFixtureFindTiles({});
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);

  await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: 0 })).rejects.toThrow();
  expect(mockNetwork.history.post.length).toBe(1);
});

test('Uses default number of retries (2) if null is set', async () => {
  jest.setTimeout(2 * 3000 + 1000);
  const { fromTime, toTime, bbox, layer } = constructFixtureFindTiles({});
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);

  await expect(layer.findTiles(bbox, fromTime, toTime, null, null, { retries: null })).rejects.toThrow();
  expect(mockNetwork.history.post.length).toBe(3);
});
