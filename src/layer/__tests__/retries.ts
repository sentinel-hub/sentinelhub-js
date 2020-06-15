import 'jest-setup';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { constructFixtureFindTiles } from './retries.fixtures';

const mockNetwork = new MockAdapter(axios);

test('S1GRDLayer.findTiles retries correctly on network errors', async () => {
  // we need to adjust jest timeout until we have support for setting the delay when retrying,
  // otherwise the test will time out:
  jest.setTimeout(7000);

  mockNetwork.onPost().replyOnce(500);
  mockNetwork.onPost().replyOnce(500);
  const {
    mockedResponse,
    expectedResultTiles,
    expectedResultHasMore,
    fromTime,
    toTime,
    bbox,
    layer,
  } = constructFixtureFindTiles({});
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime);

  // check that 3 network calls were made:
  expect(mockNetwork.history.post.length).toBe(3);

  // check final response:
  expect(hasMore).toBe(expectedResultHasMore);
  expect(tiles).toStrictEqual(expectedResultTiles);
});
