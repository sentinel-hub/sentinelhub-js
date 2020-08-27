import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { setAuthToken, isAuthTokenSet } from '../../index';
import { S2L1CLayer, BBox, CRS_EPSG4326 } from '../../index';
import { constructFixtureFindTilesSearchIndex } from './fixtures.findTilesS2L1C';

const AUTH_TOKEN = 'AUTH_TOKEN';
const SEARCH_INDEX_URL = 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex';
const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/search';

const mockNetwork = new MockAdapter(axios);

describe('Test findTile using searchIndex', () => {
  beforeEach(async () => {
    setAuthToken(null);
    mockNetwork.reset();
  });

  test('searchIndex is used if token is not set', async () => {
    expect(isAuthTokenSet()).toBeFalsy();

    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesSearchIndex({});
    mockNetwork.onAny().reply(200);
    try {
      await layer.findTiles(bbox, fromTime, toTime, 5, 0);
    } catch (err) {
      //we don't care about response here
    }
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toEqual(SEARCH_INDEX_URL);
  });

  test.each([
    [20, 0.2],
    [0, 0],
    [null, null],
  ])('check if correct request is constructed', async (maxCloudCoverPercent, expectedMaxCloudCoverage) => {
    const limit: number = 5;
    const fromDate: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
    const toDate: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
    const minX: number = 19;
    const minY: number = 20;
    const maxX: number = 20;
    const maxY: number = 21;

    const bbox = new BBox(CRS_EPSG4326, minX, minY, maxX, maxY);
    const layer = new S2L1CLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      maxCloudCoverPercent: maxCloudCoverPercent,
    });
    mockNetwork.onAny().reply(200);
    try {
      await layer.findTiles(bbox, fromDate, toDate, limit, 0);
    } catch (err) {
      //we don't care about response here
    }

    const request = mockNetwork.history.post[0];
    expect(request.data).not.toBeNull();
    const { clipping, maxcount, maxCloudCoverage, timeFrom, timeTo } = JSON.parse(request.data);

    expect(maxCloudCoverage).toEqual(expectedMaxCloudCoverage);
    expect(maxcount).toEqual(limit);
    expect(new Date(timeFrom)).toEqual(fromDate);
    expect(new Date(timeTo)).toEqual(toDate);
    expect(clipping.crs.properties.name).toEqual(CRS_EPSG4326.urn);
    expect(clipping.crs.properties.name).toEqual(CRS_EPSG4326.urn);
    expect(clipping.coordinates).toMatchObject([
      [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY],
      ],
    ]);
  });

  test('response from searchIndex', async () => {
    const {
      fromTime,
      toTime,
      bbox,
      layer,
      mockedResponse,
      expectedRequest,
      expectedResultTiles,
      expectedResultHasMore,
    } = constructFixtureFindTilesSearchIndex({});

    mockNetwork.onPost().replyOnce(200, mockedResponse);

    const { tiles, hasMore } = await layer.findTiles(bbox, fromTime, toTime, 5, 0);

    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.data).not.toBeNull();
    expect(JSON.parse(request.data)).toMatchObject(expectedRequest);
    expect(tiles).toMatchObject(expectedResultTiles);
    expect(hasMore).toEqual(expectedResultHasMore);
  });
});

describe('Testing find tiles using catalog', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('Catalog is used if token is set', async () => {
    expect(isAuthTokenSet()).toBeTruthy();

    const { fromTime, toTime, bbox, layer } = constructFixtureFindTilesSearchIndex({});
    mockNetwork.onAny().reply(200);
    try {
      await layer.findTiles(bbox, fromTime, toTime, 5, 0);
    } catch (err) {
      //we don't care about response
    }
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];
    expect(request.url).toEqual(CATALOG_URL);
  });
});
