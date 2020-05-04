import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { legacyGetMapFromUrl, ApiType, legacyGetMapFromParams } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;

export default {
  title: 'legacyGetMap[Url]',
};

const baseUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;

const queryParamsEvalscript = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01T00%3A00%3A00.000Z%2F2020-01-15T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&maxcc=20&evalscript=cmV0dXJuIFtCMDEqMi41LEIwMioyLjUsQjAzKjIuNV0%3D&evalsource=S2L2A&preview=3&bgcolor=000000`;
const queryParamsNoEvalscript = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01T00%3A00%3A00.000Z%2F2020-01-15T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&maxcc=20&preview=3&bgcolor=000000`;
const queryParamsNoEvalscriptJustDates = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01%2F2020-01-15&width=512&height=512&showlogo=false&transparent=true&maxcc=20&preview=3&bgcolor=000000`;

export const WMSLegacyGetMapFromUrlWithEvalscript = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromUrl With Evalscript</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsEvalscript}`);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromUrlWithEvalscriptAndFallback = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl With Evalscript And Fallback</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const imageBlob = await legacyGetMapFromUrl(
      `${baseUrl}?${queryParamsEvalscript}`,
      ApiType.PROCESSING,
      true,
    );
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromUrl = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromUrl</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsNoEvalscript}`);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromUrl = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const imageBlob = await legacyGetMapFromUrl(
      `${baseUrl}?${queryParamsNoEvalscript}`,
      ApiType.PROCESSING,
      true,
    );
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromUrlDatesNotTimes = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromUrl Dates Not Times</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsNoEvalscriptJustDates}`);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParams = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromParams</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const params = {
    bbox: [ 1110477.1469270408, 7078680.315433605, 1115369.1167372921, 7083572.285243855 ],
    crs: "EPSG:3857",
    evalscriptoverrides: "",
    format: "image/png",
    layers: s2l2aLayerId,
    maxcc: 100,
    pane: "activeLayer",
    preview: 2,
    showlogo: false,
    time: "2019-07-01/2020-01-15",
    transparent: true,
    width: 512,
    height: 512,
  };
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const imageBlob = await legacyGetMapFromParams(baseUrl, params);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};
