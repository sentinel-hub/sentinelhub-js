import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { S5PL2Layer, CRS_EPSG3857, CRS_EPSG4326, BBox, MimeTypes, ApiType } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S5PL2_LAYER_ID) {
  throw new Error('S5PL2_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S5PL2_LAYER_ID;
const bbox = new BBox(
  CRS_EPSG3857,
  1408887.3053523689,
  5087648.602661333,
  1487158.8223163893,
  5165920.119625352,
);
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

export default {
  title: 'Sentinel 5P L2',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new S5PL2Layer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };
  const imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);
  img.src = imageUrl;

  return wrapperEl;
};

export const getMapWMS = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = new S5PL2Layer({ instanceId, layerId });
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
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

export const getMapWMSEvalscript = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS using evalscript v1</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = new S5PL2Layer({
      instanceId,
      layerId,
      evalscript: `
      var val = CLOUD_BASE_PRESSURE;
      var minVal = 10000.0;
      var maxVal = 110000.0;
      var diff = maxVal - minVal;
      var limits = [minVal, minVal + 0.125 * diff, minVal + 0.375 * diff, minVal + 0.625 * diff, minVal + 0.875 * diff, maxVal];
      var colors = [[0, 0, 0.5], [0, 0, 1], [0, 1, 1], [1, 1, 0], [1, 0, 0], [0.5, 0, 0]];
      return colorBlend(val, limits, colors);
      `,
    });
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
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

export const getMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S5PL2Layer({
      instanceId,
      layerId,
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["CO"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.CO, 2.5 * sample.CO, 2.5 * sample.CO];
      }
    `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
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

export const getMapProcessingWithoutInstance = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S5PL2Layer({
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["CO"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.CO, 2.5 * sample.CO, 2.5 * sample.CO];
      }
    `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
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

export const getMapProcessingFromLayer = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S5PL2Layer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
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

export const findTiles = () => {
  const layer = new S5PL2Layer({ instanceId, layerId, productType: 'SO2' });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2020, 2 - 1, 2, 0, 0, 0)),
      new Date(Date.UTC(2020, 2 - 1, 2, 23, 59, 59)),
      5,
      0,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findDatesUTC = () => {
  const layer = new S5PL2Layer({ instanceId, layerId, productType: 'NO2', maxCloudCoverPercent: 60 });

  const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 2 - 1, 1, 23, 59, 59));

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML =
    '<h2>findDatesUTC</h2>' + 'from: ' + fromTime.toISOString() + '<br />' + 'to: ' + toTime.toISOString();

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const dates = await layer.findDatesUTC(bbox4326, fromTime, toTime);
    containerEl.innerHTML = JSON.stringify(dates, null, true);

    const resDateStartOfDay = new Date(new Date(dates[0]).setUTCHours(0, 0, 0, 0));
    const resDateEndOfDay = new Date(new Date(dates[0]).setUTCHours(23, 59, 59, 999));

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox4326,
      fromTime: resDateStartOfDay,
      toTime: resDateEndOfDay,
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
