import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { legacyGetMapFromUrl, ApiType } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;

const gain = 2;
const gamma = 2;

export default {
  title: 'legacyGetMapFromUrl',
};

const baseUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;

const queryParams = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01T00%3A00%3A00.000Z%2F2020-01-15T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&maxcc=20&preview=3&bgcolor=000000`;
const queryParamsGain = queryParams + `&gain=${gain}`;
const queryParamsGamma = queryParams + `&gamma=${gamma}`;
const queryParamsGainGamma = queryParams + `&gain=${gain}` + `&gamma=${gamma}`;

// Processing API

export const ProcessingLegacyGetMapFromUrl = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Processing LegacyGetMapFromUrl With WMS Fallback</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParams}`, ApiType.PROCESSING, true);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const ProcessingLegacyGetMapFromUrlGainGamma = () => {
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
      const imageBlobNoGainGamma = await legacyGetMapFromUrl(
        `${baseUrl}?${queryParams}`,
        ApiType.PROCESSING,
        true,
      );
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await legacyGetMapFromUrl(
        `${baseUrl}?${queryParamsGain}`,
        ApiType.PROCESSING,
        true,
      );
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await legacyGetMapFromUrl(
        `${baseUrl}?${queryParamsGamma}`,
        ApiType.PROCESSING,
        true,
      );
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await legacyGetMapFromUrl(
        `${baseUrl}?${queryParamsGainGamma}`,
        ApiType.PROCESSING,
        true,
      );
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

// OGC API

export const WMSLegacyGetMapFromUrl = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>WMS LegacyGetMapFromUrl</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParams}`);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const WMSLegacyGetMapFromUrlGainGamma = () => {
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
      const imageBlobNoGainGamma = await legacyGetMapFromUrl(`${baseUrl}?${queryParams}`);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsGain}`);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsGamma}`);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsGainGamma}`);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
