import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { BBox, CRS_EPSG4326, ApiType, MimeTypes, WmtsLayer, invalidateCaches } from '../../index';

import '../../../jest-setup';
import { bboxToXyzGrid } from '../wmts.utils';
import { CRS_EPSG3857 } from '../../crs';

const mockNetwork = new MockAdapter(axios);

beforeEach(async () => {
  await invalidateCaches();
});

test('WmtsLayer.getMap uses tileCoord instead of bbox', async () => {
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layerId = 'planet_medres_normalized_analytic_2019-06_2019-11_mosaic';
  const baseTemplateUrl = `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-06_2019-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png`;
  const layer = new WmtsLayer({
    baseUrl: 'https://getCapabilities.com',
    layerId,
    resourceUrl: baseTemplateUrl + `?api_key=${process.env.PLANET_API_KEY}`,
  });
  mockNetwork.reset();
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(),
    toTime: new Date(),
    width: 256,
    height: 256,
    tileCoord: {
      x: 8852,
      y: 9247,
      z: 14,
    },

    format: MimeTypes.PNG,
  };
  mockNetwork.onAny().replyOnce(200, '');
  await layer.getMap(getMapParams, ApiType.WMTS);
  expect(mockNetwork.history.get.length).toBe(1);

  const { url } = mockNetwork.history.get[0];
  expect(url).toHaveOrigin('https://tiles.planet.com');
  expect(url).toHaveBaseUrl(
    `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-06_2019-11_mosaic/gmap/${getMapParams.tileCoord.z}/${getMapParams.tileCoord.x}/${getMapParams.tileCoord.y}.png`,
  );
});

test('WmtsLayer.getMap uses bbox', async () => {
  const bbox = new BBox(
    CRS_EPSG3857,
    1289034.0450012125,
    1188748.6638910607,
    1291480.029906338,
    1191194.6487961877,
  );
  const layerId = 'planet_medres_normalized_analytic_2019-06_2019-11_mosaic';
  const baseTemplateUrl = `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-06_2019-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png`;
  const layer = new WmtsLayer({
    baseUrl: 'https://getCapabilities.com',
    layerId,
    resourceUrl: baseTemplateUrl + `?api_key=${process.env.PLANET_API_KEY}`,
  });

  mockNetwork.reset();
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(),
    toTime: new Date(),
    width: 256,
    height: 256,
    format: MimeTypes.PNG,
  };

  mockNetwork.onAny().replyOnce(200, ''); // we don't care about the response, we will just inspect the request params

  await layer.getMap(getMapParams, ApiType.WMTS);

  expect(mockNetwork.history.get.length).toBe(1);

  const { url } = mockNetwork.history.get[0];
  const { tiles } = bboxToXyzGrid(bbox, 256, 256, 256);
  expect(url).toHaveOrigin('https://tiles.planet.com');
  expect(url).toHaveBaseUrl(
    `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-06_2019-11_mosaic/gmap/${tiles[0].z}/${tiles[0].x}/${tiles[0].y}.png`,
  );
});
