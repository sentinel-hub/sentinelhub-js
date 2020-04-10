import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { S2L2ALayer, CRS_EPSG4326, BBox, MimeTypes, ApiType } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S2L2A_LAYER_ID;
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);
const geometryPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [12.5, 43.0],
      [12.9, 42.5],
      [12.5, 42.0],
      [12.0, 42.5],
      [12.5, 43.0],
    ],
  ],
};
const geometryMultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [12.5, 43.0],
        [12.9, 42.5],
        [12.5, 42.0],
        [12.0, 42.5],
        [12.5, 43.0],
      ],
    ],
  ],
};

export default {
  title: 'Sentinel 2 L2A',
};

export const GetMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS) for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layerS2L2A = new S2L2ALayer({ instanceId, layerId });

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

export const GetMapWMS = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId });

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

export const GetMapWMSWithGeometryMultiPolygon = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      geometry: geometryMultiPolygon,
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

export const GetMapProcessing = () => {
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
      layerId,
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

export const GetMapProcessingWithGeometryPolygon = () => {
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
      layerId,
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
      geometry: geometryPolygon,
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

export const GetMapProcessingEvalscripturl = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-2 L2A by setting evalscriptUrl</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      evalscriptUrl:
        'https://raw.githubusercontent.com/sentinel-hub/custom-scripts/master/sentinel-2/ulyssys_water_quality_viewer/src/script.js',
    });

    const getMapParams = {
      bbox: new BBox(
        CRS_EPSG4326,
        17.416763305664066,
        46.6560347296143,
        18.06289672851563,
        47.102849101370325,
      ),
      fromTime: new Date(Date.UTC(2019, 9 - 1, 5, 0, 0, 0)),
      toTime: new Date(Date.UTC(2019, 9 - 1, 5, 23, 59, 59)),
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

export const GetMapProcessingEvalscripturlVersion2 = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML =
    '<h2>GetMap with Processing for Sentinel-2 L2A by setting evalscriptUrl with version2 script for ndwi</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      evalscriptUrl:
        'https://gist.githubusercontent.com/dgostencnik/49a8620816d47d75a2bb8433eea03984/raw/6a478bc7d6e898f2720385738fb38889424f4483/s2-ndwi-v2',
    });

    const getMapParams = {
      bbox: new BBox(
        CRS_EPSG4326,
        17.416763305664066,
        46.6560347296143,
        18.06289672851563,
        47.102849101370325,
      ),
      fromTime: new Date(Date.UTC(2019, 9 - 1, 5, 0, 0, 0)),
      toTime: new Date(Date.UTC(2019, 9 - 1, 5, 23, 59, 59)),
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

export const GetMapWMSMaxCC20vs60 = () => {
  const layerS2L2A20 = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 20 });
  const layerS2L2A60 = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 60 });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `
  <h2>GetMap: maxCC=20 vs maxCC=60</h2>
  <p>top left part of left image should be white (cc of the tile is above 20)</p>
  <p>TODO: this story doesn't work because there is no data for S-2 in 2014 available; should be fixed.</p>
  `;

  const img20 = document.createElement('img');
  img20.width = '512';
  img20.height = '512';
  img20.style.border = '2px solid green';
  img20.style.margin = '10px';
  wrapperEl.insertAdjacentElement('beforeend', img20);

  const img60 = document.createElement('img');
  img60.width = '512';
  img60.height = '512';
  img60.style.border = '2px solid blue';
  img60.style.margin = '10px';
  wrapperEl.insertAdjacentElement('beforeend', img60);

  const perform = async () => {
    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2014, 1 - 1, 14, 0, 0, 0)),
      toTime: new Date(Date.UTC(2014, 1 - 1, 14, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const imageBlob20 = await layerS2L2A20.getMap(getMapParams, ApiType.WMS);
    img20.src = URL.createObjectURL(imageBlob20);

    const imageBlob60 = await layerS2L2A60.getMap(getMapParams, ApiType.WMS);
    img60.src = URL.createObjectURL(imageBlob60);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const FindTiles = () => {
  const maxCloudCoverPercent = 60;
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
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

export const findFlyovers = () => {
  const layer = new S2L2ALayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

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
    const flyovers = await layer.findFlyovers(bbox4326, fromTime, toTime, 20, 50);
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
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findDatesUTC = () => {
  const maxCloudCoverPercent = 60;
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    maxCloudCoverPercent,
  });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findDatesUTC for Sentinel-2 L2A; maxcc = ${maxCloudCoverPercent}</h2>`;

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const dates = await layerS2L2A.findDatesUTC(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    );

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
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};
