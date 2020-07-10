import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { legacyGetMapFromParams, ApiType, Interpolator } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

if (!process.env.S5PL2_LAYER_ID) {
  throw new Error('S5PL2_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;
const s5pLayerId = process.env.S5PL2_LAYER_ID;
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
const upsamplingNearest = Interpolator.NEAREST;
const upsamplingBilinear = Interpolator.BILINEAR;
const upsamplingBicubic = Interpolator.BICUBIC;

const redRange = [0.2, 0.8];
const greenRange = [0.2, 0.8];
const blueRange = [0.2, 0.8];
const minQa = 25;

const timeString = '2019-10-01/2020-04-23';

const basicParams = {
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

const paramsWithGain = { ...basicParams, gain: gain };
// EOBrowser example for GAIN:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=1&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsWithGamma = { ...basicParams, gamma: gamma };
// EOBrowser example for GAMMA:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=1&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsWithGainAndGamma = { ...basicParams, gain: gain, gamma: gamma };
// EOBrowser example for GAIN AND GAMMA:
// https://apps.sentinel-hub.com/eo-browser/?lat=40.5486&lng=-3.7824&zoom=12&time=2020-02-23&preset=1_TRUE_COLOR&gainOverride=2.0&gammaOverride=2&redRangeOverride=[0,1]&greenRangeOverride=[0,1]&blueRangeOverride=[0,1]&datasource=Sentinel-2%20L2A

const paramsS5P = {
  maxcc: maxCC,
  layers: s5pLayerId,
  time: timeString,
  showlogo: false,
  width: 512,
  height: 512,
  bbox: [1400000, 5100000, 1600000, 5300000],
  format: 'image/jpeg',
  crs: 'EPSG:3857',
  preview: 2,
  bgcolor: '000000',
};

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
    const imageBlob = await legacyGetMapFromParams(baseUrl, basicParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsGainGamma = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

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
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl With WMS Fallback</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    try {
      const imageBlobNoGainGamma = await legacyGetMapFromParams(baseUrl, basicParams, ApiType.PROCESSING);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await legacyGetMapFromParams(baseUrl, paramsWithGain, ApiType.PROCESSING);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await legacyGetMapFromParams(baseUrl, paramsWithGamma, ApiType.PROCESSING);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await legacyGetMapFromParams(
        baseUrl,
        paramsWithGainAndGamma,
        ApiType.PROCESSING,
      );
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsUpsamplingS5p = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const imgDefaultUpsampling = document.createElement('img');
  imgDefaultUpsampling.width = '256';
  imgDefaultUpsampling.height = '256';

  const imgNearest = document.createElement('img');
  imgNearest.width = '256';
  imgNearest.height = '256';

  const imgBilinear = document.createElement('img');
  imgBilinear.width = '256';
  imgBilinear.height = '256';

  const imgBicubic = document.createElement('img');
  imgBicubic.width = '256';
  imgBicubic.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl With WMS Fallback</h2>';
  wrapperEl.innerHTML += '<h4>default upsampling | nearest | bilinear | bicubic</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgDefaultUpsampling);
  wrapperEl.insertAdjacentElement('beforeend', imgNearest);
  wrapperEl.insertAdjacentElement('beforeend', imgBilinear);
  wrapperEl.insertAdjacentElement('beforeend', imgBicubic);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    paramsS5P.evalscript =
      'dmFyIHZhbCA9IENMT1VEX0JBU0VfUFJFU1NVUkU7CiAgICAgIHZhciBtaW5WYWwgPSAxMDAwMC4wOwogICAgICB2YXIgbWF4VmFsID0gMTEwMDAwLjA7CiAgICAgIHZhciBkaWZmID0gbWF4VmFsIC0gbWluVmFsOwogICAgICB2YXIgbGltaXRzID0gW21pblZhbCwgbWluVmFsICsgMC4xMjUgKiBkaWZmLCBtaW5WYWwgKyAwLjM3NSAqIGRpZmYsIG1pblZhbCArIDAuNjI1ICogZGlmZiwgbWluVmFsICsgMC44NzUgKiBkaWZmLCBtYXhWYWxdOwogICAgICB2YXIgY29sb3JzID0gW1swLCAwLCAwLjVdLCBbMCwgMCwgMV0sIFswLCAxLCAxXSwgWzEsIDEsIDBdLCBbMSwgMCwgMF0sIFswLjUsIDAsIDBdXTsKICAgICAgcmV0dXJuIGNvbG9yQmxlbmQodmFsLCBsaW1pdHMsIGNvbG9ycyk7';

    try {
      const imageBlobDefaultUpsampling = await legacyGetMapFromParams(baseUrl, paramsS5P, ApiType.PROCESSING);
      imgDefaultUpsampling.src = URL.createObjectURL(imageBlobDefaultUpsampling);

      const imageBlobNearest = await legacyGetMapFromParams(
        baseUrl,
        { ...paramsS5P, upsampling: upsamplingNearest },
        ApiType.PROCESSING,
      );
      imgNearest.src = URL.createObjectURL(imageBlobNearest);

      const imageBlobBilinear = await legacyGetMapFromParams(
        baseUrl,
        { ...paramsS5P, upsampling: upsamplingBilinear },
        ApiType.PROCESSING,
      );
      imgBilinear.src = URL.createObjectURL(imageBlobBilinear);

      const imageBlobBicubic = await legacyGetMapFromParams(
        baseUrl,
        { ...paramsS5P, upsampling: upsamplingBicubic },
        ApiType.PROCESSING,
      );
      imgBicubic.src = URL.createObjectURL(imageBlobBicubic);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromParamsMinQaS5p = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const imgDefaultMinQa = document.createElement('img');
  imgDefaultMinQa.width = '256';
  imgDefaultMinQa.height = '256';

  const imgMinQa0 = document.createElement('img');
  imgMinQa0.width = '256';
  imgMinQa0.height = '256';

  const imgMinQa100 = document.createElement('img');
  imgMinQa100.width = '256';
  imgMinQa100.height = '256';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl With WMS Fallback</h2>';
  wrapperEl.innerHTML += '<h4>default minQa | minQa=0 | minQa=100</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgDefaultMinQa);
  wrapperEl.insertAdjacentElement('beforeend', imgMinQa0);
  wrapperEl.insertAdjacentElement('beforeend', imgMinQa100);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    paramsS5P.evalscript =
      'dmFyIHZhbCA9IEhDSE87CiAgICAgIHZhciBtaW5WYWwgPSAxMDAwMC4wOwogICAgICB2YXIgbWF4VmFsID0gMTEwMDAwLjA7CiAgICAgIHZhciBsaW1pdHMgPSBbbWluVmFsLCBtYXhWYWxdOwogICAgICB2YXIgY29sb3JzID0gW1swLCAwLCAxXSwgWzEsIDAsIDBdXTsKICAgICAgcmV0dXJuIGNvbG9yQmxlbmQodmFsLCBsaW1pdHMsIGNvbG9ycyk7';
    paramsS5P.bbox = [1000000, 5000000, 2000000, 6000000];

    try {
      const imageBlobDefaultMinQa = await legacyGetMapFromParams(baseUrl, paramsS5P, ApiType.PROCESSING);
      imgDefaultMinQa.src = URL.createObjectURL(imageBlobDefaultMinQa);

      const imageBlobMinQa0 = await legacyGetMapFromParams(
        baseUrl,
        paramsS5P,
        ApiType.PROCESSING,
        null,
        null,
        {
          minQa: 0,
        },
      );
      imgMinQa0.src = URL.createObjectURL(imageBlobMinQa0);

      const imageBlobMinQa100 = await legacyGetMapFromParams(
        baseUrl,
        paramsS5P,
        ApiType.PROCESSING,
        null,
        null,
        {
          minQa: 100,
        },
      );
      imgMinQa100.src = URL.createObjectURL(imageBlobMinQa100);
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
    const imageBlob = await legacyGetMapFromParams(baseUrl, basicParams);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromParamsGainGamma = () => {
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
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromUrl</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    try {
      const imageBlobNoGainGamma = await legacyGetMapFromParams(baseUrl, basicParams);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await legacyGetMapFromParams(baseUrl, paramsWithGain);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await legacyGetMapFromParams(baseUrl, paramsWithGamma);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await legacyGetMapFromParams(baseUrl, paramsWithGainAndGamma);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
