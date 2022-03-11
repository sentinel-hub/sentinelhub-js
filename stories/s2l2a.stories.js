import { createFindDatesUTCStory, renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  setAuthToken,
  S2L2ALayer,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  CRS_EPSG3857,
  registerHostnameReplacing,
  requestAuthToken,
  StatisticsProviderType,
} from '../dist/sentinelHub.esm';

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

const geometryStats = {
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

const gain = 2;
const gamma = 2;
const redRange = { from: 0.2, to: 0.8 };
const greenRange = { from: 0.2, to: 0.8 };
const blueRange = { from: 0.2, to: 0.8 };
const TRUE_COLOR_EVALSCRIPT = `//VERSION=3
  function setup() {
    return {
      input: ["B02", "B03", "B04"],
      output: { bands: 3 }
    };
  }

  function evaluatePixel(sample) {
    return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
  }
`;
const TRUE_COLOR_TRANSPARENT_EVALSCRIPT = `//VERSION=3
  function setup() {
    return {
      input: ["B02", "B03", "B04", "dataMask"],
      output: { bands: 4 }
    };
  }

  function evaluatePixel(sample) {
    return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
  }
`;

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
      evalscript: TRUE_COLOR_EVALSCRIPT,
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
      evalscript: TRUE_COLOR_EVALSCRIPT,
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

export const GetMapProcessingAlternativeHostname = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  if (!process.env.ALTERNATIVE_HOSTNAME) {
    return '<div>Please set ALTERNATIVE_HOSTNAME to use this story</div>';
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>GetMap - on alternative hostname (${process.env.ALTERNATIVE_HOSTNAME})</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    registerHostnameReplacing('services.sentinel-hub.com', process.env.ALTERNATIVE_HOSTNAME);

    try {
      // await setAuthTokenWithOAuthCredentials();
      const authToken = await requestAuthToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
      setAuthToken(authToken);
      console.log('Auth token retrieved and set successfully');

      const layerS2L2A = new S2L2ALayer({
        instanceId,
        layerId,
        evalscript: 'return [2.5 * B04, 2.5 * B03, 2.5 * B02];',
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
    } finally {
      // reset auth token back, so that we don't break other stories:
      registerHostnameReplacing('services.sentinel-hub.com', 'services.sentinel-hub.com');
      const authTokenServices = await requestAuthToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
      setAuthToken(authTokenServices);
      console.log('Auth token reset.');
    }
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

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

    try {
      const imageBlobNoGainGamma = layerS2L2A.getMapUrl(getMapParams, ApiType.WMS);
      imgNoGainGamma.src = imageBlobNoGainGamma;

      const imageBlobGainIs2 = layerS2L2A.getMapUrl(getMapParamsGainIs2, ApiType.WMS);
      imgGainIs2.src = imageBlobGainIs2;

      const imageBlobGammaIs2 = layerS2L2A.getMapUrl(getMapParamsGammaIs2, ApiType.WMS);
      imgGammaIs2.src = imageBlobGammaIs2;

      const imageBlobGainGamaAre2 = layerS2L2A.getMapUrl(getMapParamsGainGammaAre2, ApiType.WMS);
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

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

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

export const getMapWMSGainNotSetOptions = () => {
  const imgNoGain = document.createElement('img');
  imgNoGain.width = '256';
  imgNoGain.height = '256';

  const imgGainIsUndefined = document.createElement('img');
  imgGainIsUndefined.width = '256';
  imgGainIsUndefined.height = '256';

  const imgGainIsNull = document.createElement('img');
  imgGainIsNull.width = '256';
  imgGainIsNull.height = '256';

  const imgGainHasValue = document.createElement('img');
  imgGainHasValue.width = '256';
  imgGainHasValue.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapWMSGainNotSetOptions</h2>';
  wrapperEl.innerHTML += '<h4>no gain param | gain = undefined | gain = null | gain param has value </h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGain);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIsUndefined);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIsNull);
  wrapperEl.insertAdjacentElement('beforeend', imgGainHasValue);

  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 0 });

    const getMapParamsNoGain = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIsUndefined = { ...getMapParamsNoGain, effects: { gain: undefined } };
    const getMapParamsGainIsNull = { ...getMapParamsNoGain, effects: { gain: null } };
    const getMapParamsGainHasValue = { ...getMapParamsNoGain, effects: { gain: gain } };

    try {
      const imageBlobNoGain = await layerS2L2A.getMap(getMapParamsNoGain, ApiType.WMS);
      imgNoGain.src = URL.createObjectURL(imageBlobNoGain);

      const imageBlobGainIsUndefined = await layerS2L2A.getMap(getMapParamsGainIsUndefined, ApiType.WMS);
      imgGainIsUndefined.src = URL.createObjectURL(imageBlobGainIsUndefined);

      const imageBlobGainIsNull = await layerS2L2A.getMap(getMapParamsGainIsNull, ApiType.WMS);
      imgGainIsNull.src = URL.createObjectURL(imageBlobGainIsNull);

      const imageBlobGainHasValue = await layerS2L2A.getMap(getMapParamsGainHasValue, ApiType.WMS);
      imgGainHasValue.src = URL.createObjectURL(imageBlobGainHasValue);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapWMSBasicColorManipulation = () => {
  const imgNoEffects = document.createElement('img');
  imgNoEffects.width = '256';
  imgNoEffects.height = '256';

  const imgRed = document.createElement('img');
  imgRed.width = '256';
  imgRed.height = '256';

  const imgGreen = document.createElement('img');
  imgGreen.width = '256';
  imgGreen.height = '256';

  const imgBlue = document.createElement('img');
  imgBlue.width = '256';
  imgBlue.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapWMSEffects</h2>';
  wrapperEl.innerHTML += '<h4>no effects | red | green | blue</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoEffects);
  wrapperEl.insertAdjacentElement('beforeend', imgRed);
  wrapperEl.insertAdjacentElement('beforeend', imgGreen);
  wrapperEl.insertAdjacentElement('beforeend', imgBlue);

  const perform = async () => {
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId, maxCloudCoverPercent: 0 });

    // go to the url and set the time range t0 2020-05-09 - 2020-06-09
    // change R,G,B sliders to 0.2 and 0.8 to check if it works correctly
    // this story uses the bbox that is used for timelapse
    // https://webdev.sentinel-hub.com/eo-browser2/?lat=42.1616&lng=11.7773&zoom=11&time=2020-06-09&preset=1_TRUE_COLOR&datasource=Sentinel-2%20L1C
    const customBBox = new BBox(CRS_EPSG3857, 1275237, 5149410, 1346858.494277954, 5221031.49427795);

    const getMapParams = {
      bbox: customBBox,
      fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 5 - 1, 31, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsRed = { ...getMapParams, effects: { redRange: redRange } };
    const getMapParamsGreen = { ...getMapParams, effects: { greenRange: greenRange } };
    const getMapParamsBlue = { ...getMapParams, effects: { blueRange: blueRange } };

    try {
      const imageBlobNoEffects = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
      imgNoEffects.src = URL.createObjectURL(imageBlobNoEffects);

      const imageBlobRed = await layerS2L2A.getMap(getMapParamsRed, ApiType.WMS);
      imgRed.src = URL.createObjectURL(imageBlobRed);

      const imageBlobGreen = await layerS2L2A.getMap(getMapParamsGreen, ApiType.WMS);
      imgGreen.src = URL.createObjectURL(imageBlobGreen);

      const imageBlobBlue = await layerS2L2A.getMap(getMapParamsBlue, ApiType.WMS);
      imgBlue.src = URL.createObjectURL(imageBlobBlue);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
      throw err;
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
      evalscript: TRUE_COLOR_EVALSCRIPT,
    });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

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
  wrapperEl.innerHTML += '<p>Note: Whole images can be transparent if there is no data to show</p>';
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
      fromTime: new Date(Date.UTC(2020, 4 - 1, 15, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 4 - 1, 15, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.PNG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

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

export const getMapProcessingAdvancedRGB = () => {
  const imgOriginal = document.createElement('img');
  imgOriginal.width = '256';
  imgOriginal.height = '256';

  const imgRGB1 = document.createElement('img');
  imgRGB1.width = '256';
  imgRGB1.height = '256';

  const imgRGB2 = document.createElement('img');
  imgRGB2.width = '256';
  imgRGB2.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>S2L2A getMapProcessingAdvancedRGB</h2>';
  wrapperEl.innerHTML += '<h4>original | no change | black & white</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgOriginal);
  wrapperEl.insertAdjacentElement('beforeend', imgRGB1);
  wrapperEl.insertAdjacentElement('beforeend', imgRGB2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 0,
      evalscript: TRUE_COLOR_EVALSCRIPT,
    });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 9 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsRGB1 = {
      ...getMapParams,
      effects: {
        customEffect: ({ r, g, b, a }) => ({ r, g, b, a }),
      },
    };

    const getMapParamsRGB2 = {
      ...getMapParams,
      effects: {
        customEffect: ({ r, g, b, a }) => ({
          r: r + g + b < 0.6 ? 0 : 1,
          g: r + g + b < 0.6 ? 0 : 1,
          b: r + g + b < 0.6 ? 0 : 1,
          a: a,
        }),
      },
    };

    try {
      const imageBlobOriginal = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
      imgOriginal.src = URL.createObjectURL(imageBlobOriginal);

      const imageBlobRGB1 = await layerS2L2A.getMap(getMapParamsRGB1, ApiType.PROCESSING);
      imgRGB1.src = URL.createObjectURL(imageBlobRGB1);

      const imageBlobRGB2 = await layerS2L2A.getMap(getMapParamsRGB2, ApiType.PROCESSING);
      imgRGB2.src = URL.createObjectURL(imageBlobRGB2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetHugeMap = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '3000';
  img.height = '3000';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId,
      evalscript: TRUE_COLOR_EVALSCRIPT,
      maxCloudCoverPercent: 100,
    });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 3000,
      height: 3000,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layerS2L2A.getHugeMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetMapProcessingOutputResponse = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img0 = document.createElement('img');
  img0.width = '256';
  img0.height = '256';

  const img1 = document.createElement('img');
  img1.width = '256';
  img1.height = '256';

  const img2 = document.createElement('img');
  img2.width = '256';
  img2.height = '256';

  const img3 = document.createElement('img');
  img3.width = '256';
  img3.height = '256';

  const img4 = document.createElement('img');
  img4.width = '256';
  img4.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-2 L2A, output response set to:</h2>';
  wrapperEl.innerHTML += `<h4>
    outputResponseId not set <br />
    outputResponseId = "default" <br /> 
    outputResponseId = "index" <br /> 
    outputResponseId = "" (defaults to "default") <br />
    outputResponseId used with WMS (ERROR)
  </h4>`;
  wrapperEl.insertAdjacentElement('beforeend', img0);
  wrapperEl.insertAdjacentElement('beforeend', img1);
  wrapperEl.insertAdjacentElement('beforeend', img2);
  wrapperEl.insertAdjacentElement('beforeend', img3);
  wrapperEl.insertAdjacentElement('beforeend', img4);

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
          output: [{ id: "default", bands: 4 }, { id: "index", bands: 2 }]
        };
      }

      function evaluatePixel(sample) {
        return {
            default: [4 * sample.B04, 4 * sample.B03, 4 * sample.B02, sample.dataMask],
            index: [sample.B04, sample.dataMask] 
          };
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
    const getMapParamsDefault = { ...getMapParams, outputResponseId: 'default' };
    const getMapParamsIndex = { ...getMapParams, outputResponseId: 'index' };
    const getMapParamsEmptyOutputResponseId = { ...getMapParams, outputResponseId: '' };

    const imageBlob0 = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
    img0.src = URL.createObjectURL(imageBlob0);

    const imageBlob1 = await layerS2L2A.getMap(getMapParamsDefault, ApiType.PROCESSING);
    img1.src = URL.createObjectURL(imageBlob1);

    const imageBlob2 = await layerS2L2A.getMap(getMapParamsIndex, ApiType.PROCESSING);
    img2.src = URL.createObjectURL(imageBlob2);

    const imageBlob3 = await layerS2L2A.getMap(getMapParamsEmptyOutputResponseId, ApiType.PROCESSING);
    img3.src = URL.createObjectURL(imageBlob3);

    try {
      const imageBlob4 = await layerS2L2A.getMap(getMapParamsIndex, ApiType.WMS);
      img4.src = URL.createObjectURL(imageBlob4);
    } catch (e) {
      console.error(e);
      const p = document.createElement('p');
      p.innerHTML = '<b>error for using outputResponseId with WMS:</b> ' + e;
      wrapperEl.insertAdjacentElement('beforeend', p);
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const FindTilesSearchIndex = () => {
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
    setAuthToken(null);
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

export const FindTilesCatalog = () => {
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
    await setAuthTokenWithOAuthCredentials();

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

export const FindTilesCatalogIntersect = () => {
  const maxCloudCoverPercent = 60;
  const intersectingPolygon = {
    type: 'Polygon',
    coordinates: [
      [
        [12.731094360351562, 42.53916873854672],
        [12.739591598510742, 42.531389566042044],
        [12.744312286376953, 42.53708173859982],
        [12.745342254638672, 42.542520440973085],
        [12.731094360351562, 42.53916873854672],
      ],
    ],
  };
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    maxCloudCoverPercent,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findTiles for Sentinel-2 L2A; intersect = polygon</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const data = await layerS2L2A.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
      null,
      intersectingPolygon,
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

export const findDatesUTCSearchIndex = () =>
  createFindDatesUTCStory(
    new S2L2ALayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 60,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    false,
  );

export const findDatesUTCCatalog = () =>
  createFindDatesUTCStory(
    new S2L2ALayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 60,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    true,
  );

export const stats = () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
  });

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L2A;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    bins: 10,
    geometry: geometryStats,
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

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L2A;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    bins: 10,
    geometry: geometryStats,
  };
  const perform = async () => {
    const stats = await layerS2L2A.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const statsWithStatisticalApi = () => {
  const statsEvalScript = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [
        "B04",
        "B08",
        "dataMask"
      ]
    }],
    output: [
      {
        id: "stats",
        bands: 1
      },
  
      {
        id: "dataMask",
        bands: 1
      }]
  };
};

  function evaluatePixel(samples) {
    let index = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
    return {
      stats: [index],
      dataMask: [samples.dataMask],
    };
  }
`;
  const layerS2L2A = new S2L2ALayer({
    instanceId,
    layerId,
    evalscript: statsEvalScript,
  });

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L2A with Statistical Api;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10 / 111111,
    bins: 10,
    geometry: geometryStats,
    crs: CRS_EPSG4326,
  };
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const stats = await layerS2L2A.getStats(params, {}, StatisticsProviderType.STAPI);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetMapJPEGOrPNG = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const formats = [MimeTypes.PNG, MimeTypes.JPEG, MimeTypes.JPEG_OR_PNG];
  const bboxes = [
    new BBox(CRS_EPSG4326, 11.0, 41.98, 12.4, 43.03), // partial coverage
    new BBox(CRS_EPSG4326, 13.0, 41.98, 14.4, 43.03), // full coverage
  ];
  const fromTime = new Date(Date.UTC(2021, 3 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2021, 3 - 1, 1, 23, 59, 59));

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with either JPEG or PNG (depending on data coverage)</h2>';
  wrapperEl.style.backgroundImage =
    'linear-gradient(0deg, transparent 50%, #aaa 50%), linear-gradient(90deg, #aaa 50%, #ccc 50%)';
  wrapperEl.style.backgroundSize = '50px 50px,50px 50px';
  wrapperEl.style.backgroundPosition = '0 0, 0 25px';

  const imgs = [];
  for (let b = 0; b < bboxes.length; b++) {
    const divEl = document.createElement('div');
    wrapperEl.insertAdjacentElement('beforeend', divEl);
    for (let f = 0; f < formats.length; f++) {
      const img = document.createElement('img');
      img.width = '256';
      img.height = '256';
      imgs.push(img);
      divEl.insertAdjacentElement('beforeend', img);
    }
  }

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId,
      evalscript: TRUE_COLOR_TRANSPARENT_EVALSCRIPT,
    });

    for (let b = 0; b < bboxes.length; b++) {
      for (let f = 0; f < formats.length; f++) {
        const getMapParams = {
          bbox: bboxes[b],
          fromTime: fromTime,
          toTime: toTime,
          width: 256,
          height: 256,
          format: formats[f],
        };
        const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
        imgs[b * formats.length + f].src = URL.createObjectURL(imageBlob);
      }
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
