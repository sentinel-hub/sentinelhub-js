import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import makeServiceWorkerEnv from 'service-worker-mock';

import { constructFixtureFindTiles } from './retries.fixtures';

const mockNetwork = new MockAdapter(axios);
const mockServiceWorker = makeServiceWorkerEnv();
// test('Retries correctly on network errors', async () => {
//   // we need to adjust jest timeout until we have support for setting the delay when retrying,
//   // otherwise the test will time out:
//   jest.setTimeout(7000);
//   const {
//     fromTime,
//     toTime,
//     bbox,
//     layer,
//     mockedResponse,
//     expectedResultTiles,
//     expectedResultHasMore,
//   } = constructFixtureFindTiles({});

//   mockNetwork.onPost().replyOnce(200, mockedResponse);

//   const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

//   expect(mockNetwork.history.post.length).toBe(1);
//   expect(tiles).toStrictEqual(expectedResultTiles);
//   expect(hasMore).toBe(expectedResultHasMore);
// });

describe('Service worker', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('should delete old caches on activate', async () => {
    jest.setTimeout(7000);
    const {
      fromTime,
      toTime,
      bbox,
      layer,
      mockedResponse,
      //   expectedResultTiles,
      //   expectedResultHasMore,
    } = constructFixtureFindTiles({});
    const requestsConfig = {
      expiresIn: 60,
    };
    mockNetwork.onPost().replyOnce(200, mockedResponse);
    const response = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
    console.log(response);
    const cache = await self.caches.open('sentinelhub-v1');
    cache.keys().then(function(keys) {});
    expect(self.snapshot().caches['sentinelhub-v1']).toBeDefined();
  });
});
