import { setAuthToken, isAuthTokenSet } from '../../index';
import { mockNetwork } from './testUtils.findTiles';

export const AUTH_TOKEN = 'AUTH_TOKEN';
export const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search';

export async function checkIfCorrectEndpointIsUsedFindDatesUTC(
  token: string,
  fixture: Record<string, any>,
  endpoint: string,
): Promise<void> {
  setAuthToken(token);
  expect(isAuthTokenSet()).toBe(!!token);

  const { fromTime, toTime, bbox, layer } = fixture;
  mockNetwork.onAny().reply(200);
  try {
    await layer.findDatesUTC(bbox, fromTime, toTime, { cache: { expiresIn: 0 } });
  } catch (err) {
    //we don't care about response
  }
  expect(mockNetwork.history.post.length).toBe(1);
  const request = mockNetwork.history.post[0];
  expect(request.url).toEqual(endpoint);
}

export async function checkRequestFindDatesUTC(fixtures: Record<string, any>): Promise<void> {
  const { bbox, expectedRequest, fromTime, layer, toTime } = fixtures;
  mockNetwork.onAny().reply(200);
  try {
    await layer.findDatesUTC(bbox, fromTime, toTime, { cache: { expiresIn: 0 } });
  } catch (err) {
    //we don't care about response here
  }
  const request = mockNetwork.history.post[0];
  expect(request.data).not.toBeNull();
  expect(JSON.parse(request.data)).toStrictEqual(expectedRequest);
}

export async function checkResponseFindDatesUTC(fixtures: Record<string, any>): Promise<void> {
  const { fromTime, toTime, bbox, layer, mockedResponse, expectedRequest, expectedResult } = fixtures;

  mockNetwork.onPost().replyOnce(200, mockedResponse);

  const response = await layer.findDatesUTC(bbox, fromTime, toTime, { cache: { expiresIn: 0 } });
  expect(mockNetwork.history.post.length).toBe(1);
  const request = mockNetwork.history.post[0];
  expect(request.data).not.toBeNull();
  expect(JSON.parse(request.data)).toStrictEqual(expectedRequest);
  expect(response).toStrictEqual(expectedResult);
}
