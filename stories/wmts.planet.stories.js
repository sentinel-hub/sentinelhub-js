import { WmtsLayer, CRS_EPSG3857, BBox, MimeTypes, ApiType, LayersFactory } from '../dist/sentinelHub.esm';

if (!process.env.PLANET_API_KEY) {
  throw new Error('Please set the API Key for PLANET (PLANET_API_KEY env vars)');
}

const baseUrl = `https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=${process.env.PLANET_API_KEY}`;
const layerId = 'planet_medres_normalized_analytic_2017-06_2017-11_mosaic';

const bbox = new BBox(
  CRS_EPSG3857,
  1289034.0450012125,
  1188748.6638910607,
  1291480.029906338,
  1191194.6487961877,
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
    const layer = new WmtsLayer({ baseUrl, layerId });

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

export const getMap = () => {
  const img = document.createElement('img');
  img.width = '256';
  img.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap (WMTS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);
  const perform = async () => {
    const layer = new WmtsLayer({ baseUrl, layerId });

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
