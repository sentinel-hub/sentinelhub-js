import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';
import fetch from 'node-fetch';

import { setAuthToken, invalidateCaches, CacheTarget, CancelToken, isCancelled, ApiType } from '../../index';
import { cacheableRequestsInProgress } from '../../utils/cacheHandlers';

import '../../../jest-setup';
import { constructFixtureFindTiles } from './fixtures.findTiles';
import { RequestConfiguration } from '../../utils/cancelRequests';
import { constructFixtureGetMap } from './fixtures.getMap';

const createRequestPromise = (useCache = true, setRequestError: (err: any) => {}): any => {
  const { fromTime, toTime, bbox, layer, mockedResponse } = constructFixtureFindTiles({});
  let cancelToken = new CancelToken();
  const requestsConfig: RequestConfiguration = {
    cancelToken: cancelToken,
  };

  if (useCache) {
    requestsConfig.cache = {
      expiresIn: 60,
      targets: [CacheTarget.MEMORY],
    };
  }

  const thenFn = jest.fn();
  const catchFn = jest.fn(err => {
    setRequestError(err);
  });

  const requestPromise = layer
    .findTiles(bbox, fromTime, toTime, null, null, requestsConfig)
    .then(thenFn)
    .catch(catchFn);

  return {
    requestPromise: requestPromise,
    thenFn: thenFn,
    catchFn: catchFn,
    cancelToken: cancelToken,
    mockedResponse: mockedResponse,
  };
};
const mockNetwork = new MockAdapter(axios, { delayResponse: 10 });

describe('Handling cancelled requests', () => {
  beforeEach(async () => {
    Object.assign(global, makeServiceWorkerEnv(), fetch); // adds these functions to the global object
    await invalidateCaches();
    setAuthToken(undefined);
    mockNetwork.reset();
    cacheableRequestsInProgress.clear();
  });

  it('doesnt cancel a request if cancel() is not called', async () => {
    let requestError = null;
    const { requestPromise, thenFn, catchFn, mockedResponse } = createRequestPromise(
      true,
      err => (requestError = err),
    );

    mockNetwork.onPost().replyOnce(200, mockedResponse);

    await Promise.all([requestPromise]);
    expect(thenFn).toHaveBeenCalled();
    expect(catchFn).not.toHaveBeenCalled();
    expect(requestError).toBeNull();
    expect(isCancelled(requestError)).toBeFalsy();
    expect(cacheableRequestsInProgress.size).toBe(0);
  });

  it.each([[true], [false]])('cancels a request', async useCache => {
    let requestError = null;
    const { requestPromise, thenFn, catchFn, cancelToken } = createRequestPromise(
      useCache,
      err => (requestError = err),
    );

    mockNetwork.onPost().replyOnce(200);

    await Promise.all([requestPromise, setTimeout(() => cancelToken.cancel(), 1)]);
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
    expect(isCancelled(requestError)).toBeTruthy();
    //check if request was removed from requestsInProgress
    expect(cacheableRequestsInProgress.size).toBe(0);
  });

  it('makes a second request after first is cancelled', async () => {
    let requestError = null;
    const { requestPromise, thenFn, catchFn, cancelToken, mockedResponse } = createRequestPromise(
      true,
      err => (requestError = err),
    );

    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse);

    //first request is cancelled
    await Promise.all([requestPromise, setTimeout(() => cancelToken.cancel(), 1)]);
    expect(thenFn).not.toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
    expect(isCancelled(requestError)).toBeTruthy();
    expect(cacheableRequestsInProgress.size).toBe(0);

    //repeat request without cancelling
    requestError = null;

    const { requestPromise: requestPromise2, thenFn: thenFn2, catchFn: catchFn2 } = createRequestPromise(
      true,
      err => (requestError = err),
    );

    await Promise.all([requestPromise2]);
    expect(thenFn2).toHaveBeenCalled();
    expect(catchFn2).not.toHaveBeenCalled();
    expect(requestError).toBeNull();
    expect(isCancelled(requestError)).toBeFalsy();
    expect(cacheableRequestsInProgress.size).toBe(0);
  });

  it('handles multiple requests with the same cancel token', async () => {
    let requestError = null;
    const { requestPromise, cancelToken, mockedResponse } = createRequestPromise(
      true,
      err => (requestError = err),
    );

    const { layer, getMapParams, mockedResponse: mockedResponse2 } = constructFixtureGetMap();

    mockNetwork.onPost().replyOnce(200, mockedResponse);
    mockNetwork.onPost().replyOnce(200, mockedResponse2);

    setAuthToken('EXAMPLE_TOKEN');

    await Promise.all([
      requestPromise,
      layer
        .getMap(getMapParams, ApiType.PROCESSING, {
          cancelToken: cancelToken,
          cache: {
            expiresIn: 60,
            targets: [CacheTarget.MEMORY],
          },
        })
        .catch((err: any) => console.log(err)),
      setTimeout(() => cancelToken.cancel(), 10),
    ]);

    expect(cacheableRequestsInProgress.size).toBe(0);
  });
});
