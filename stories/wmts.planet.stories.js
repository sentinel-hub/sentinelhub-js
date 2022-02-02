import {
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  LayersFactory,
  CRS_EPSG4326,
  S2L1CLayer,
  PlanetNicfiLayer,
} from '../dist/sentinelHub.esm';

if (!process.env.PLANET_API_KEY) {
  throw new Error('Please set the API Key for PLANET (PLANET_API_KEY env vars)');
}
const instanceId = process.env.INSTANCE_ID;
const s2LayerId = process.env.S2L1C_LAYER_ID;

const baseUrl = `https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=${process.env.PLANET_API_KEY}`;
const layerId = 'planet_medres_normalized_analytic_2017-06_2017-11_mosaic';

const bbox = new BBox(
  CRS_EPSG3857,
  1289034.0450012125,
  1188748.6638910607,
  1291480.029906338,
  1191194.6487961877,
);

const notExactTileBbox = new BBox(
  CRS_EPSG4326,
  9.546533077955246,
  -2.7491153895984772,
  9.940667599439623,
  -2.3553726144954044,
);

export default {
  title: 'WMTS - Planet',
};

export const getMapBbox = () => {
  const img = document.createElement('img');
  img.width = '256';
  img.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with bbox(WMTS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  const perform = async () => {
    const layer = new PlanetNicfiLayer({ baseUrl, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 256,
      height: 256,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});
  return wrapperEl;
};

export const getMapBboxStitched = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const s2Img = document.createElement('img');
  s2Img.width = '512';
  s2Img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with bbox(WMTS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  wrapperEl.insertAdjacentElement('beforeend', s2Img);
  const perform = async () => {
    const layer = new PlanetNicfiLayer({ baseUrl, layerId });
    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2LayerId });

    const getMapParams = {
      bbox: notExactTileBbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);

    const getMapParamsS2 = {
      bbox: notExactTileBbox,
      fromTime: new Date(Date.UTC(2019, 4 - 1, 14, 0, 0, 0)),
      toTime: new Date(Date.UTC(2019, 4 - 1, 17, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      showlogo: false,
    };
    const s2ImageBlob = await layerS2L1C.getMap(getMapParamsS2, ApiType.WMS);
    s2Img.src = URL.createObjectURL(s2ImageBlob);
  };
  perform().then(() => {});
  return wrapperEl;
};

export const getMap = () => {
  const img = document.createElement('img');
  img.width = '256';
  img.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap (WMTS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  const perform = async () => {
    const layer = new PlanetNicfiLayer({ baseUrl, layerId });

    const getMapParams = {
      tileCoord: {
        x: 8852,
        y: 9247,
        z: 14,
      },
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 256,
      height: 256,
      format: MimeTypes.JPEG,
      matrixSet: 'GoogleMapsCompatible15',
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});
  return wrapperEl;
};

export const getMapWmtsLayersFactory = () => {
  const img = document.createElement('img');
  img.width = '256';
  img.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMTS</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = (await LayersFactory.makeLayers(baseUrl, lId => layerId === lId))[0];

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 256,
      height: 256,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMTS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};
