import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  WmsLayer,
  S1GRDAWSEULayer,
  S2L2ALayer,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

if (!process.env.S1GRDIW_LAYER_ID) {
  throw new Error('S1GRDIW_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;
const s1grdLayerId = process.env.S1GRDIW_LAYER_ID;
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

export default {
  title: 'Demo',
};

export const S2GetMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS) for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layerS2L2A = new S2L2ALayer({ instanceId, layerId: s2l2aLayerId });

  const getMapParams = {
    bbox: bbox4326,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };
  const imageUrl = layerS2L2A.getMapUrl(getMapParams, ApiType.WMS);
  img.src = imageUrl;

  return wrapperEl;
};

export const S2GetMapWMS = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId: s2l2aLayerId });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const S2GetMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId: s2l2aLayerId,
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
      }
    `,
    });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const S1GetMapProcessingFromLayer = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-1 GRD</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({ instanceId, layerId: s1grdLayerId });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WmsGetMap = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for generic WMS layer</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    const layer = new WmsLayer({
      baseUrl: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
      layerId: 'PROBAV_S1_TOA_333M',
    });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0)), // 2020-01-10/2020-01-10
      toTime: new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const S2FindTiles = () => {
  const maxCloudCoverPercent = 60;
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId: s2l2aLayerId,
    maxCloudCoverPercent,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findTiles for Sentinel-2 L2A; maxcc = ${maxCloudCoverPercent}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layerS2L2A.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const S1GRDFindTiles = () => {
  const layerS1 = new S1GRDAWSEULayer({ instanceId, layerId: s1grdLayerId });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles for Sentinel-1 GRD</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const data = await layerS1.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
    );

    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const S2FindFlyovers = () => {
  const layerS2L2A = new S2L2ALayer({ instanceId, layerId: s2l2aLayerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers for Sentinel-2 L2A</h2>';

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
    const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 6, 59, 59));
    const flyovers = await layerS2L2A.findFlyovers(bbox4326, fromTime, toTime, 20, 50);
    flyoversContainerEl.innerHTML = JSON.stringify(flyovers, null, true);

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox4326,
      fromTime: fromTime,
      toTime: toTime,
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};
