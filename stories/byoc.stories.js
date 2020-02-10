import {
  BYOCLayer,
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.BYOC_LAYER_ID) {
  throw new Error('BYOC_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.BYOC_LAYER_ID;
const bbox = new BBox(CRS_EPSG4326, 10.9433305, 41.6851063, 12.2326018, 42.1466082);

export default {
  title: 'BYOC with v3 script',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new BYOCLayer(instanceId, layerId);

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2019, 11 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 1, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
    maxCCPercent: 50,
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
    const layer = new BYOCLayer(instanceId, layerId);

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2016, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 2 - 1, 1, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      maxCCPercent: 100,
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

    const layer = new BYOCLayer(
      instanceId,
      layerId,
      `
      //VERSION=3
      function setup() {
        return {
          input: ["IR", "G", "B"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [sample.IR/255, sample.G/255, sample.B/255];
      }
    `,
    );

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      maxCCPercent: 100,
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

    const layer = new BYOCLayer(instanceId, layerId);

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
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
  const layer = new BYOCLayer(
    instanceId,
    layerId,
    null,
    null,
    null,
    null,
    null,
    '0ed669e7-0f09-4909-9b9b-ffff1c9eaca5',
  );
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2016, 1 - 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      null,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

function renderTilesList(containerEl, list) {
  list.forEach(tile => {
    const ul = document.createElement('ul');
    containerEl.appendChild(ul);
    for (let key in tile) {
      const li = document.createElement('li');
      ul.appendChild(li);
      let text;
      if (tile[key] instanceof Object) {
        text = JSON.stringify(tile[key]);
      } else {
        text = tile[key];
      }
      li.innerHTML = `${key} : ${text}`;
    }
  });
}

async function setAuthTokenWithOAuthCredentials() {
  if (isAuthTokenSet()) {
    console.log('Auth token is already set.');
    return;
  }
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const authToken = await requestAuthToken(clientId, clientSecret);
  setAuthToken(authToken);
  console.log('Auth token retrieved and set successfully');
}
