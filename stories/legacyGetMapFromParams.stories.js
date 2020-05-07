import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { legacyGetMapFromParams, ApiType } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;
const baseUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;

export default {
  title: 'legacyGetMapFromParams [Playground]',
};

const madridBboxAsArrayEPSG3857 = [
  -430493.3433021127,
  4931105.568733289,
  -410925.4640611076,
  4950673.447974297,
];
const maxCC = 0;
const gain = 2;
const gamma = 2;
const timeString = '2019-10-01/2020-04-23';

const basicParamsObject = {
  maxcc: maxCC,
  layers: s2l2aLayerId,
  time: timeString,
  showlogo: false,
  width: 512,
  height: 512,
  bbox: madridBboxAsArrayEPSG3857,
  format: 'image/jpeg',
  crs: 'EPSG:3857',
  preview: 2,
  bgcolor: '000000',
};
// EOBrowser example:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsObjectWithGain = {
  ...basicParamsObject,
  gain: gain,
};
// EOBrowser example for GAIN:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsObjectWithGamma = {
  ...basicParamsObject,
  gamma: gamma,
};
// EOBrowser example for GAMMA:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsObjectWithGainAndGamma = {
  ...basicParamsObject,
  gain: gain,
  gamma: gamma,
};
// EOBrowser example for GAIN AND GAMMA:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

// PROCESSING API

export const ProcessingLegacyGetMapFromBasicParams = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>ProcessingLegacyGetMapFromParams</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const imageBlob = await legacyGetMapFromParams(baseUrl, basicParamsObject, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsWithGain = () => {
  const imgGainIs1 = document.createElement('img');
  imgGainIs1.width = '512';
  imgGainIs1.height = '512';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '512';
  imgGainIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>ProcessingLegacyGetMapFromParams; no gain vs gain=${gain}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    try {
      const imageBlobGainIs1 = await legacyGetMapFromParams(baseUrl, basicParamsObject, ApiType.PROCESSING);
      imgGainIs1.src = URL.createObjectURL(imageBlobGainIs1);

      const imageBlobGainIs2 = await legacyGetMapFromParams(
        baseUrl,
        paramsObjectWithGain,
        ApiType.PROCESSING,
      );
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsWithGamma = () => {
  const imgGammaIs1 = document.createElement('img');
  imgGammaIs1.width = '512';
  imgGammaIs1.height = '512';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '512';
  imgGammaIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>ProcessingLegacyGetMapFromParams; no gamma vs gamma=${gamma}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);

  const perform = async () => {
    try {
      await setAuthTokenWithOAuthCredentials();

      const imageBlobGammaIs1 = await legacyGetMapFromParams(baseUrl, basicParamsObject, ApiType.PROCESSING);
      imgGammaIs1.src = URL.createObjectURL(imageBlobGammaIs1);

      const imageBlobGammaIs2 = await legacyGetMapFromParams(
        baseUrl,
        paramsObjectWithGamma,
        ApiType.PROCESSING,
      );
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

// OGC API (WMS)

export const WMSLegacyGetMapFromBasicParams = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMSLegacyGetMapFromParams</h2>';
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromParams(baseUrl, basicParamsObject);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsWithGain = () => {
  const imgGainIs1 = document.createElement('img');
  imgGainIs1.width = '512';
  imgGainIs1.height = '512';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '512';
  imgGainIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>ProcessingLegacyGetMapFromParams; no gain vs gain=${gain}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);

  const perform = async () => {
    try {
      const imageBlobGainIs1 = await legacyGetMapFromParams(baseUrl, basicParamsObject);
      imgGainIs1.src = URL.createObjectURL(imageBlobGainIs1);

      const imageBlobGainIs2 = await legacyGetMapFromParams(baseUrl, paramsObjectWithGain);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsWithGamma = () => {
  const imgGammaIs1 = document.createElement('img');
  imgGammaIs1.width = '512';
  imgGammaIs1.height = '512';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '512';
  imgGammaIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>ProcessingLegacyGetMapFromParams; no gamma vs gamma=${gamma}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);

  const perform = async () => {
    try {
      const imageBlobGammaIs1 = await legacyGetMapFromParams(baseUrl, basicParamsObject);
      imgGammaIs1.src = URL.createObjectURL(imageBlobGammaIs1);

      const imageBlobGammaIs2 = await legacyGetMapFromParams(baseUrl, paramsObjectWithGamma);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsWithGainAndGamma = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '512';
  imgNoGainGamma.height = '512';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '512';
  imgGainGammaAre2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>WMSLegacyGetMapFromParams; no gain/gamma vs gain=${gain} and gamma=${gamma}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    try {
      const imageBlobNoGainGamma = await legacyGetMapFromParams(baseUrl, basicParamsObject);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainGamaAre2 = await legacyGetMapFromParams(baseUrl, paramsObjectWithGainAndGamma);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
