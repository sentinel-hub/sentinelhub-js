import {
  legacyGetMapFromUrl, ApiType, setAuthToken
} from '../dist/sentinelHub.esm';

const instanceId = process.env.STORYBOOK_INSTANCE_ID;
if (!instanceId) {
  throw new Error("STORYBOOK_INSTANCE_ID environment variable is not defined!");
};
const s2l2aLayerId = process.env.STORYBOOK_S2L2A_LAYER_ID;
if (!s2l2aLayerId) {
  throw new Error("STORYBOOK_S2L2A_LAYER_ID environment variable is not defined!");
};

export default {
  title: 'legacyGetMap[Url]',
};

const baseUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;

const queryParamsEvalscript = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01T00%3A00%3A00.000Z%2F2020-01-15T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&maxcc=20&evalscript=cmV0dXJuIFtCMDEqMi41LEIwMioyLjUsQjAzKjIuNV0%3D&evalsource=S2L2A&preview=3&bgcolor=000000`
const queryParamsNoEvalscript = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01T00%3A00%3A00.000Z%2F2020-01-15T23%3A59%3A59.000Z&width=512&height=512&showlogo=false&transparent=true&maxcc=20&preview=3&bgcolor=000000`
const queryParamsNoEvalscriptJustDates = `version=1.1.1&service=WMS&request=GetMap&format=image%2Fjpeg&crs=EPSG%3A3857&layers=${s2l2aLayerId}&bbox=-430493.3433021127%2C4931105.568733289%2C-410925.4640611076%2C4950673.447974297&time=2019-07-01%2F2020-01-15&width=512&height=512&showlogo=false&transparent=true&maxcc=20&preview=3&bgcolor=000000`;

export const WMSLegacyGetMapFromUrlWithEvalscript = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsEvalscript}`);
    img.src = URL.createObjectURL(imageBlob);
  }
  perform().then(() => {});

  return img;
};

export const ProcessingLegacyGetMapFromUrlWithEvalscriptAndFallback = () => {
  if (!process.env.STORYBOOK_AUTH_TOKEN) {
    return '<div>Please set auth token for Processing API (STORYBOOK_AUTH_TOKEN env var)</div>';
  };
  setAuthToken(process.env.STORYBOOK_AUTH_TOKEN);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsEvalscript}`, ApiType.PROCESSING, true);
    img.src = URL.createObjectURL(imageBlob);
  }
  perform().then(() => {});

  return img;
};

export const WMSLegacyGetMapFromUrl = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsNoEvalscript}`);
    img.src = URL.createObjectURL(imageBlob);
  }
  perform().then(() => {});

  return img;
};

export const ProcessingLegacyGetMapFromUrl = () => {
  if (!process.env.STORYBOOK_AUTH_TOKEN) {
    return '<div>Please set auth token for Processing API (STORYBOOK_AUTH_TOKEN env var)</div>';
  };
  setAuthToken(process.env.STORYBOOK_AUTH_TOKEN);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsNoEvalscript}`, ApiType.PROCESSING, true);
    img.src = URL.createObjectURL(imageBlob);
  }
  perform().then(() => {});

  return img;
};

export const WMSLegacyGetMapFromUrlDatesNotTimes = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const perform = async () => {
    const imageBlob = await legacyGetMapFromUrl(`${baseUrl}?${queryParamsNoEvalscriptJustDates}`);
    img.src = URL.createObjectURL(imageBlob);
  }
  perform().then(() => {});

  return img;
};
