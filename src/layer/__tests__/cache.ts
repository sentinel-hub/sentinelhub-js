import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { constructFixtureFindTiles } from './fixtures.findTiles';
import { constructFixtureGetMap } from './fixtures.getMap';
import { ApiType } from 'src';
import { setAuthToken } from 'src/auth';

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
    await new Promise(r => setTimeout(r, 2000));
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
