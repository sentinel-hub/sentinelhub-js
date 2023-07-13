import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  BBox,
  CRS_EPSG4326,
  ApiType,
  MimeTypes,
  setAuthToken,
  invalidateCaches,
  GetMapParams,
} from '../../index';

import '../../../jest-setup';
import { WmsWmtMsLayer } from '../WmsWmtMsLayer';

const mockNetwork = new MockAdapter(axios);

beforeEach(async () => {
  await invalidateCaches();
});

test('WmsWmtMsLayer.getMapUrl returns an URL', () => {
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layerId = 'PROBAV_S1_TOA_333M';
  const layer = new WmsWmtMsLayer({
    baseUrl: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
    layerId,
  });

  const getMapParams: GetMapParams = {
    bbox: bbox,
    fromTime: null,
    toTime: new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59)),
    width: 511.675,
    height: 512.424,
    format: MimeTypes.JPEG,
  };
  const imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);

  expect(imageUrl).toHaveOrigin('https://proba-v-mep.esa.int');
  expect(imageUrl).toHaveQueryParamsValues({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetMap',
    format: 'image/jpeg',
    layers: layerId,
    srs: 'EPSG:3857',
    bbox: '2115070.325072198,2273030.926987689,2226389.8158654715,2391878.587944315',
    time: '2020-01-10',
    width: '512',
    height: '512',
  });
  expect(imageUrl).not.toHaveQueryParams(['showlogo']);
  expect(imageUrl).not.toHaveQueryParams(['transparent']);
});

test('WmsWmtMsLayer.getMap makes an appropriate request', async () => {
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layerId = 'PROBAV_S1_TOA_333M';
  const layer = new WmsWmtMsLayer({
    baseUrl: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
    layerId,
  });

  mockNetwork.reset();
  mockNetwork.onAny().replyOnce(200, ''); // we don't care about the response, we will just inspect the request params

  const getMapParams: GetMapParams = {
    bbox: bbox,
    fromTime: null,
    toTime: new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59)),
    width: 511.675,
    height: 512.424,
    format: MimeTypes.JPEG,
  };
  await layer.getMap(getMapParams, ApiType.WMS);

  expect(mockNetwork.history.get.length).toBe(1);

  const { url } = mockNetwork.history.get[0];
  expect(url).toHaveOrigin('https://proba-v-mep.esa.int');
  expect(url).toHaveQueryParamsValues({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetMap',
    format: 'image/jpeg',
    layers: layerId,
    srs: 'EPSG:3857',
    bbox: '2115070.325072198,2273030.926987689,2226389.8158654715,2391878.587944315',
    time: '2020-01-10',
    width: '512',
    height: '512',
  });
});

test('WmsWmtMsLayer.findDates should not include auth token in GetCapabilities request', async () => {
  const layerId = 'PROBAV_S1_TOA_333M';
  const layer = new WmsWmtMsLayer({
    baseUrl: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
    layerId,
  });
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const fromTime = new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59));

  setAuthToken('asdf1234'); // this should not have any effect

  mockNetwork.reset();
  // we just test that the request is correct, we don't mock the response data:
  mockNetwork.onAny().replyOnce(200, '');

  try {
    await layer.findDatesUTC(bbox, fromTime, toTime);
  } catch (ex) {
    // we don't care about success, we will just inspect the request
  }

  expect(mockNetwork.history.get.length).toBe(1);

  const { url } = mockNetwork.history.get[0];
  expect(url).toHaveOrigin('https://proba-v-mep.esa.int');
  expect(url).toHaveQueryParamsValues({
    service: 'wms',
    request: 'GetCapabilities',
    format: 'text/xml',
  });
});
