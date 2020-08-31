import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { setAuthToken, isAuthTokenSet } from '../../index';
import { S3SLSTRLayer, BBox, CRS_EPSG4326 } from '../../index';
import {
  constructFixtureFindTilesSearchIndex,
  constructFixtureFindTilesCatalog,
} from './fixtures.findTilesS3SLTR';

const AUTH_TOKEN = 'AUTH_TOKEN';
const SEARCH_INDEX_URL = 'https://creodias.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex';
const CATALOG_URL = 'https://creodias.sentinel-hub.com/api/v1/catalog/search';

const mockNetwork = new MockAdapter(axios);

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

  test.each([
    [20, 20],
    [0, 0],
    [null, null],
  ])('check if correct request is constructed', async (maxCloudCoverPercent, expectedMaxCloudCoverage) => {
    const limit = 5;
    const fromDate: Date = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
    const toDate: Date = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
    const minX = 19;
    const minY = 20;
    const maxX = 20;
    const maxY = 21;

    const bbox = new BBox(CRS_EPSG4326, minX, minY, maxX, maxY);
    const layer = new S3SLSTRLayer({
      instanceId: 'INSTANCE_ID',
      layerId: 'LAYER_ID',
      maxCloudCoverPercent: maxCloudCoverPercent,
    });

    mockNetwork.onAny().reply(200);
    try {
      await layer.findTiles(bbox, fromDate, toDate, limit, 0, { cache: { expiresIn: 0 } });
    } catch (err) {
      //we don't care about response
    }
    expect(mockNetwork.history.post.length).toBe(1);
    const request = mockNetwork.history.post[0];

    const { bbox: bboxRequest, datetime, collections, limit: limitRequest, query } = JSON.parse(request.data);
    const [timeFrom, timeTo] = datetime.split('/');
    expect(bboxRequest).toEqual([minX, minY, maxX, maxY]);
    expect(new Date(timeFrom)).toEqual(fromDate);
    expect(new Date(timeTo)).toEqual(toDate);
    expect(collections).toEqual([layer.dataset.catalogCollectionId]);
    expect(limitRequest).toEqual(limit);
    if (maxCloudCoverPercent !== null) {
      expect(query['eo:cloud_cover']).toEqual({ lte: expectedMaxCloudCoverage });
    } else {
      expect(query).toEqual({});
    }
  });

  test('response from catalog', async () => {
    const {
      fromTime,
      toTime,
      bbox,
      layer,
      mockedResponse,
      expectedRequest,
      expectedResultTiles,
      expectedResultHasMore,
    } = constructFixtureFindTilesCatalog({});

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
