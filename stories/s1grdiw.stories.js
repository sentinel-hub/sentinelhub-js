import {
  S1GRDAWSEULayer,
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  CRS_EPSG4326,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  OrbitDirection,
  AcquisitionMode,
  Polarization,
  Resolution,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error("INSTANCE_ID environment variable is not defined!");
};

if (!process.env.S1GRDIW_LAYER_ID) {
  throw new Error("S1GRDIW_LAYER_ID environment variable is not defined!");
};

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S1GRDIW_LAYER_ID;

export default {
  title: 'Sentinel 1 GRD IW - AWS',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>GetMapUrl (WMS)</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const layer = new S1GRDAWSEULayer(instanceId, layerId);

  // const bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22);
  const bbox = new BBox(CRS_EPSG3857, 2115070.33, 2273030.93, 2226389.82, 2391878.59);
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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
  wrapperEl.innerHTML = "<h2>GetMap with WMS</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    const layer = new S1GRDAWSEULayer(instanceId, layerId);

    // const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const bbox = new BBox(CRS_EPSG3857, 2115070.33, 2273030.93, 2226389.82, 2391878.59);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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
  wrapperEl.innerHTML = "<h2>GetMap with Processing</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer(
      instanceId,
      layerId,
      `
      //VERSION=3
      function setup() {
        return {
          input: ["VV"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.VV, 2.5 * sample.VV, 2.5 * sample.VV];
      }
    `,
    );

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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

export const getMapProcessingWithoutInstance = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>GetMap with Processing</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer(
      null,
      null,
      `
      //VERSION=3
      function setup() {
        return {
          input: ["VV"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.VV, 2.5 * sample.VV, 2.5 * sample.VV];
      }
    `,null, null, null, null, AcquisitionMode.IW, Polarization.DV, Resolution.HIGH

    );

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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
  wrapperEl.innerHTML = "<h2>GetMap with Processing</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer(instanceId, layerId);

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
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

export const findTiles = () => {
  const layer = new S1GRDAWSEULayer(instanceId, layerId);
  const bbox = new BBox(CRS_EPSG4326, 11.9, 12.34, 42.05, 42.19);
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>findTiles</h2>";
  wrapperEl.insertAdjacentElement("beforeend", containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      null,
      OrbitDirection.ASCENDING,
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

export const findDates = () => {
  const layer = new S1GRDAWSEULayer(instanceId, layerId);
  const bbox = new BBox(CRS_EPSG4326, 11.9, 12.34, 42.05, 42.19);
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>findDates</h2>" + 
    "from: " + new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)) + "<br />" +
    "to: " + new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59));
  wrapperEl.insertAdjacentElement("beforeend", containerEl);

  const perform = async () => {
    const data = await layer.findDates(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      OrbitDirection.ASCENDING,
    );
    
    containerEl.innerHTML = "<ul>" + data.map(d => "<li>"+d+"</li>") + "</ul>";
  };
  perform().then(() => {});

  return wrapperEl;
};

async function setAuthTokenWithOAuthCredentials () {
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