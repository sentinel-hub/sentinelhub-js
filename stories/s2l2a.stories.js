import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { S2L2ALayer, CRS_EPSG4326, BBox, MimeTypes, ApiType, CRS_EPSG3857 } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S2L2A_LAYER_ID;
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);
const bbox3857 = new BBox(
  CRS_EPSG3857,
  1174072.7544603075,
  5009377.085697314,
  1252344.2714243277,
  5087648.602661333,
);
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

const gain = 2;
const gamma = 2;

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
  wrapperEl.innerHTML = `<h2>GetMap: maxCC=20 vs maxCC=60</h2>`;

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
      fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 15, 6, 59, 59)),
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

export const GetMapProcessingMaxCC20vs60 = () => {
  const layerS2L2A20 = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 20 });
  const layerS2L2A60 = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 60 });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>GetMap: maxCC=20 vs maxCC=60</h2>`;

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
    await setAuthTokenWithOAuthCredentials();

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 15, 6, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const imageBlob20 = await layerS2L2A20.getMap(getMapParams, ApiType.PROCESSING);
    img20.src = URL.createObjectURL(imageBlob20);

    const imageBlob60 = await layerS2L2A60.getMap(getMapParams, ApiType.PROCESSING);
    img60.src = URL.createObjectURL(imageBlob60);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapURLGainGamma = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '256';
  imgNoGainGamma.height = '256';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '256';
  imgGainIs2.height = '256';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '256';
  imgGammaIs2.height = '256';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '256';
  imgGainGammaAre2.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapURLGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 0 });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, gain: gain };
    const getMapParamsGammaIs2 = { ...getMapParams, gamma: gamma };
    const getMapParamsGainGammaAre2 = { ...getMapParams, gain: gain, gamma: gamma };

    try {
      const imageBlobNoGainGamma = await layerS2L2A.getMapUrl(getMapParams, ApiType.WMS);
      imgNoGainGamma.src = imageBlobNoGainGamma;

      const imageBlobGainIs2 = await layerS2L2A.getMapUrl(getMapParamsGainIs2, ApiType.WMS);
      imgGainIs2.src = imageBlobGainIs2;

      const imageBlobGammaIs2 = await layerS2L2A.getMapUrl(getMapParamsGammaIs2, ApiType.WMS);
      imgGammaIs2.src = imageBlobGammaIs2;

      const imageBlobGainGamaAre2 = await layerS2L2A.getMapUrl(getMapParamsGainGammaAre2, ApiType.WMS);
      imgGainGammaAre2.src = imageBlobGainGamaAre2;
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapWMSGainGamma = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '256';
  imgNoGainGamma.height = '256';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '256';
  imgGainIs2.height = '256';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '256';
  imgGammaIs2.height = '256';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '256';
  imgGainGammaAre2.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapWMSGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 0 });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, gain: gain };
    const getMapParamsGammaIs2 = { ...getMapParams, gamma: gamma };
    const getMapParamsGainGammaAre2 = { ...getMapParams, gain: gain, gamma: gamma };

    try {
      const imageBlobNoGainGamma = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layerS2L2A.getMap(getMapParamsGainIs2, ApiType.WMS);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layerS2L2A.getMap(getMapParamsGammaIs2, ApiType.WMS);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layerS2L2A.getMap(getMapParamsGainGammaAre2, ApiType.WMS);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingGainGamma = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '256';
  imgNoGainGamma.height = '256';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '256';
  imgGainIs2.height = '256';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '256';
  imgGammaIs2.height = '256';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '256';
  imgGainGammaAre2.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapProcessingGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 0,
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
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, gain: gain };
    const getMapParamsGammaIs2 = { ...getMapParams, gamma: gamma };
    const getMapParamsGainGammaAre2 = { ...getMapParams, gain: gain, gamma: gamma };

    try {
      const imageBlobNoGainGamma = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layerS2L2A.getMap(getMapParamsGainIs2, ApiType.PROCESSING);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layerS2L2A.getMap(getMapParamsGammaIs2, ApiType.PROCESSING);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layerS2L2A.getMap(getMapParamsGainGammaAre2, ApiType.PROCESSING);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingGainGammaCheckTransparency = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '256';
  imgNoGainGamma.height = '256';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '256';
  imgGainIs2.height = '256';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '256';
  imgGammaIs2.height = '256';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '256';
  imgGainGammaAre2.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapProcessingGainGamma; Check transparency</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.style.backgroundColor = 'lightgreen';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 0,
      evalscript: `
        //VERSION=3
        let minVal = 0.0;
        let maxVal = 0.4;
        
        let viz = new HighlightCompressVisualizer(minVal, maxVal);
        
        function setup() {
          return {
            input: ["B04", "B03", "B02","dataMask"],
            output: { bands: 4 }
          };
        }
        
        function evaluatePixel(samples) {
          let val = [samples.B04, samples.B03, samples.B02,samples.dataMask];
          return viz.processList(val);
        }`,
    });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2020, 5 - 1, 20, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 5 - 1, 20, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.PNG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, gain: gain };
    const getMapParamsGammaIs2 = { ...getMapParams, gamma: gamma };
    const getMapParamsGainGammaAre2 = { ...getMapParams, gain: gain, gamma: gamma };

    try {
      const imageBlobNoGainGamma = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layerS2L2A.getMap(getMapParamsGainIs2, ApiType.PROCESSING);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layerS2L2A.getMap(getMapParamsGammaIs2, ApiType.PROCESSING);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layerS2L2A.getMap(getMapParamsGainGammaAre2, ApiType.PROCESSING);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
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

export const stats = () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
  });

  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [38.443522453308105, 29.97140509632656],
        [38.44244956970215, 29.96954625480396],
        [38.44292163848877, 29.967538666899472],
        [38.44480991363525, 29.965865645995088],
        [38.44686985015869, 29.96541950233024],
        [38.44910144805908, 29.96564257441305],
        [38.45056056976318, 29.966720749087546],
        [38.451247215270996, 29.96861682100166],
        [38.450989723205566, 29.97006673393574],
        [38.450260162353516, 29.971330743333375],
        [38.4486722946167, 29.97229732790467],
        [38.44622611999512, 29.972446032388678],
        [38.444252014160156, 29.971888389426],
        [38.443522453308105, 29.97140509632656],
      ],
    ],
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:EPSG::4326',
      },
    },
  };

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L1C;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    bins: 10,
    geometry: geometry,
  };
  const perform = async () => {
    const stats = await layerS2L2A.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const statsWithEvalscript = () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
    evalscript: `
    let ndvi = (B08 - B04) / (B08 + B04)
    return [ ndvi ]
  `,
  });

  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [38.443522453308105, 29.97140509632656],
        [38.44244956970215, 29.96954625480396],
        [38.44292163848877, 29.967538666899472],
        [38.44480991363525, 29.965865645995088],
        [38.44686985015869, 29.96541950233024],
        [38.44910144805908, 29.96564257441305],
        [38.45056056976318, 29.966720749087546],
        [38.451247215270996, 29.96861682100166],
        [38.450989723205566, 29.97006673393574],
        [38.450260162353516, 29.971330743333375],
        [38.4486722946167, 29.97229732790467],
        [38.44622611999512, 29.972446032388678],
        [38.444252014160156, 29.971888389426],
        [38.443522453308105, 29.97140509632656],
      ],
    ],
  };

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L1C;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    bins: 10,
    geometry: geometry,
  };
  const perform = async () => {
    const stats = await layerS2L2A.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};
