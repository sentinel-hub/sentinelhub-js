import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';

import { constructFixtureFindTiles } from './fixtures.findTiles';

const mockNetwork = new MockAdapter(axios);

describe('Testing caching', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('should fetch a request and cache it, where 2nd request is served from the cache', async () => {
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
    const requestsConfig = {
      expiresIn: 60,
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const responseFromMockNetwork = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    const fromCacheResponse = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(fromCacheResponse.tiles).toStrictEqual(expectedResultTiles);
    expect(fromCacheResponse.hasMore).toBe(expectedResultHasMore);
    expect(fromCacheResponse).toStrictEqual(responseFromMockNetwork);
  });

  it('should make a 2nd request after the cache has expired', async () => {
    jest.setTimeout(7000);
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    const requestsConfig = {
      expiresIn: 1,
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    await new Promise(r => setTimeout(r, 2000));
    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(2);
  });

  it('test that no responses are cached', async () => {
    jest.setTimeout(7000);
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime);
    await layer.findTiles(bbox, fromTime, toTime);

    expect(mockNetwork.history.post.length).toBe(2);
  });
});
