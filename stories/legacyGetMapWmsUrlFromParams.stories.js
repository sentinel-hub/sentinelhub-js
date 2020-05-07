import { legacyGetMapWmsUrlFromParams } from '../dist/sentinelHub.esm';

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
  title: "legacyGetMapWmsUrlFromParams [DOESN'T SUPPORT GAIN, GAMMA]",
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

export const legacyGetMapWmsUrlFromBasicParams = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>legacyGetMapWmsUrlFromParams</h2>';
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageUrl = await legacyGetMapWmsUrlFromParams(baseUrl, basicParamsObject);
    img.src = imageUrl;
  };
  perform().then(() => {});

  return wrapperEl;
};

export const legacyGetMapWmsUrlFromParamsWithGain = () => {
  const imgGainIs1 = document.createElement('img');
  imgGainIs1.width = '512';
  imgGainIs1.height = '512';

  const imgGainIs2 = document.createElement('img');
  imgGainIs2.width = '512';
  imgGainIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>legacyGetMapWmsUrlFromParams; no gain vs gain=${gain}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);

  const perform = async () => {
    try {
      const imageUrlGainIs1 = await legacyGetMapWmsUrlFromParams(baseUrl, basicParamsObject);
      imgGainIs1.src = imageUrlGainIs1;

      const imageUrlGainIs2 = await legacyGetMapWmsUrlFromParams(baseUrl, paramsObjectWithGain);
      imgGainIs2.src = imageUrlGainIs2;
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const legacyGetMapWmsUrlFromParamsWithGamma = () => {
  const imgGammaIs1 = document.createElement('img');
  imgGammaIs1.width = '512';
  imgGammaIs1.height = '512';

  const imgGammaIs2 = document.createElement('img');
  imgGammaIs2.width = '512';
  imgGammaIs2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>legacyGetMapWmsUrlFromParams; no gamma vs gamma=${gamma}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs1);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);

  const perform = async () => {
    try {
      const imageUrlGammaIs1 = await legacyGetMapWmsUrlFromParams(baseUrl, basicParamsObject);
      imgGammaIs1.src = imageUrlGammaIs1;

      const imageUrlGammaIs2 = await legacyGetMapWmsUrlFromParams(baseUrl, paramsObjectWithGamma);
      imgGammaIs2.src = imageUrlGammaIs2;
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const legacyGetMapWmsUrlFromParamsWithGainAndGamma = () => {
  const imgNoGainGamma = document.createElement('img');
  imgNoGainGamma.width = '512';
  imgNoGainGamma.height = '512';

  const imgGainGammaAre2 = document.createElement('img');
  imgGainGammaAre2.width = '512';
  imgGainGammaAre2.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>legacyGetMapWmsUrlFromParams; no gain/gamma vs gain=${gain} and gamma=${gamma}</h2>`;
  wrapperEl.innerHTML +=
    '<p><a href="https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A" target="_blank">Equivalent in EOBrowser</a></p>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    try {
      const imageUrlNoGainGamma = await legacyGetMapWmsUrlFromParams(baseUrl, basicParamsObject);
      imgNoGainGamma.src = imageUrlNoGainGamma;

      const imageUrlGainGamaAre2 = await legacyGetMapWmsUrlFromParams(baseUrl, paramsObjectWithGainAndGamma);
      imgGainGammaAre2.src = imageUrlGainGamaAre2;
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
