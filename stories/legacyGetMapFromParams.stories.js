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
const gainString = '2';
const gammaString = '2';
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
  maxcc: maxCC,
  gain: gainString,
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
// EOBrowser example for GAIN:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsObjectWithGamma = {
  maxcc: maxCC,
  gamma: gammaString,
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
// EOBrowser example for GAMMA:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

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
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>ProcessingLegacyGetMapFromParams GAIN</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    try {
      const imageBlob = await legacyGetMapFromParams(baseUrl, paramsObjectWithGain, ApiType.PROCESSING);
      img.src = URL.createObjectURL(imageBlob);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsWithGamma = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>ProcessingLegacyGetMapFromParams GAMMA</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    try {
      await setAuthTokenWithOAuthCredentials();
      const imageBlob = await legacyGetMapFromParams(baseUrl, paramsObjectWithGamma, ApiType.PROCESSING);
      img.src = URL.createObjectURL(imageBlob);
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
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromParams(baseUrl, basicParamsObject);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsWithGain = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMSLegacyGetMapFromParams GAIN</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    try {
      const imageBlob = await legacyGetMapFromParams(baseUrl, paramsObjectWithGain);
      img.src = URL.createObjectURL(imageBlob);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsWithGamma = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMSLegacyGetMapFromParams GAMMA</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    try {
      const imageBlob = await legacyGetMapFromParams(baseUrl, paramsObjectWithGamma);
      img.src = URL.createObjectURL(imageBlob);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
