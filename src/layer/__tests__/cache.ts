import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';

import { constructFixtureFindTiles } from './fixtures.findTiles';

const mockNetwork = new MockAdapter(axios);

describe('Service worker', () => {
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

  it('should cache a response and make a 2nd request after cache expires, where a 2nd network call will be made', async () => {
    jest.setTimeout(7000);
    const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
    const requestsConfig = {
      expiresIn: 1,
    };
    mockNetwork.reset();
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    jest.setTimeout(2000);
    await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);

    expect(mockNetwork.history.post.length).toBe(2);
  });
});
