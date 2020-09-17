import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { setAuthToken, isAuthTokenSet } from '../../index';

export const mockNetwork = new MockAdapter(axios);

export const AUTH_TOKEN = 'AUTH_TOKEN';
export const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/search';

export async function checkRequestFindTiles(fixtures: Record<string, any>): Promise<void> {
  const { bbox, expectedRequest, fromTime, layer, toTime } = fixtures;
  mockNetwork.onAny().reply(200);
  try {
    await layer.findTiles(bbox, fromTime, toTime, 5, 0, { cache: { expiresIn: 0 } });
  } catch (err) {
    //we don't care about response here
  }
  const request = mockNetwork.history.post[0];
  expect(request.data).not.toBeNull();
  expect(JSON.parse(request.data)).toMatchObject(expectedRequest);
}
export async function checkResponseFindTiles(fixtures: Record<string, any>): Promise<void> {
  const {
    fromTime,
    toTime,
    bbox,
    layer,
    mockedResponse,
    expectedRequest,
    expectedResultTiles,
    expectedResultHasMore,
  } = fixtures;

  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime, 5, 0, { cache: { expiresIn: 0 } });

  expect(mockNetwork.history.post.length).toBe(1);
  const request = mockNetwork.history.post[0];
  expect(request.data).not.toBeNull();
  expect(JSON.parse(request.data)).toMatchObject(expectedRequest);
  expect(tiles).toStrictEqual(expectedResultTiles);
  expect(hasMore).toEqual(expectedResultHasMore);
}
export async function checkIfCorrectEndpointIsUsed(
  token: string,
  fixture: Record<string, any>,
  endpoint: string,
): Promise<void> {
  setAuthToken(token);
  expect(isAuthTokenSet()).toBe(!!token);

  const { fromTime, toTime, bbox, layer } = fixture;
  mockNetwork.onAny().reply(200);
  try {
    await layer.findTiles(bbox, fromTime, toTime, 5, 0, { cache: { expiresIn: 0 } });
  } catch (err) {
    //we don't care about response
  }
  expect(mockNetwork.history.post.length).toBe(1);
  const request = mockNetwork.history.post[0];
  expect(request.url).toEqual(endpoint);
}
