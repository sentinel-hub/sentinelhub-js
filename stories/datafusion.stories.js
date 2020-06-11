import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  ProcessingDataFusionLayer,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  S2L1CLayer,
  S2L2ALayer,
  MosaickingOrder,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L1C_LAYER_ID) {
  throw new Error('S2L1C_LAYER_ID environment variable is not defined!');
}
if (!process.env.S2L2A_LAYER_ID) {
  throw new Error('S2L2A_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const s2l1cLayerId = process.env.S2L1C_LAYER_ID;
const s2l2aLayerId = process.env.S2L2A_LAYER_ID;
const bbox = new BBox(
  CRS_EPSG3857,
  1761109.131690461,
  4833266.172528266,
  1780677.0109314662,
  4852834.051769271,
);

export default {
  title: 'Data fusion',
};

export const getMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '300';
  img.height = '300';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2l1cLayerId });
    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId: s2l2aLayerId,
      mosaickingOrder: MosaickingOrder.LEAST_RECENT,
    });
    const layers = [
      {
        layer: layerS2L2A,
        id: 's2l2a',
        fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 26, 0, 0, 0)),
      },
      {
        layer: layerS2L1C,
        id: 's2l1c',
        fromTime: new Date(Date.UTC(2020, 2 - 1, 10, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 24, 0, 0, 0)),
      },
    ];
    const layer = new ProcessingDataFusionLayer({
      layers: layers,
      evalscript: `
        //VERSION=3
        var setup = () => ({
          input: [
            {datasource: "s2l2a", bands:["B02", "B03", "B04"], units: "REFLECTANCE", mosaicking: "ORBIT"},
            {datasource: "s2l1c", bands:["B02", "B03", "B04"], units: "REFLECTANCE"}],
          output: [
            {id: "default", bands: 3, sampleType: SampleType.AUTO}
          ]
        });


        function evaluatePixel(samples, inputData, inputMetadata, customData, outputMetadata) {
          var sample = samples.s2l2a[0];
          if (!sample) {
            return {
              default: [0, 0, 0],
            }
          }
          let val = [sample.B04, sample.B03, sample.B02];

          return {
            default: val
          }
        }
      `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
      width: 300,
      height: 300,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingEvalscriptUrl = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '300';
  img.height = '300';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing - evalscriptUrl</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2l1cLayerId });
    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId: s2l2aLayerId,
      mosaickingOrder: MosaickingOrder.LEAST_RECENT,
    });
    const layers = [
      {
        layer: layerS2L2A,
        id: 's2l2a',
        fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 26, 0, 0, 0)),
      },
      {
        layer: layerS2L1C,
        id: 's2l1c',
        fromTime: new Date(Date.UTC(2020, 2 - 1, 10, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 24, 0, 0, 0)),
      },
    ];
    const layer = new ProcessingDataFusionLayer({
      layers: layers,
      evalscriptUrl:
        'https://gist.githubusercontent.com/sinergise-anze/33fe78d9b1fd24d656882d7916a83d4d/raw/295b9d9f033c7e3f1e533363322d84846808564c/data-fusion-evalscript.js',
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
      width: 300,
      height: 300,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingGainGamma = () => {
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
  wrapperEl.innerHTML = '<h2>GetMap with Processing and gain and gamma effects</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: s2l1cLayerId });
    const layerS2L2A = new S2L2ALayer({
      instanceId,
      layerId: s2l2aLayerId,
      mosaickingOrder: MosaickingOrder.LEAST_RECENT,
    });
    const layers = [
      {
        layer: layerS2L2A,
        id: 's2l2a',
        fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 26, 0, 0, 0)),
      },
      {
        layer: layerS2L1C,
        id: 's2l1c',
        fromTime: new Date(Date.UTC(2020, 2 - 1, 10, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 24, 0, 0, 0)),
      },
    ];
    const layer = new ProcessingDataFusionLayer({
      layers: layers,
      evalscriptUrl:
        'https://gist.githubusercontent.com/sinergise-anze/33fe78d9b1fd24d656882d7916a83d4d/raw/295b9d9f033c7e3f1e533363322d84846808564c/data-fusion-evalscript.js',
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
      width: 300,
      height: 300,
      format: MimeTypes.JPEG,
    };

    const gain = 2;
    const gamma = 2;
    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

    try {
      const imageBlobNoGainGamma = await layer.getMap(getMapParams, ApiType.PROCESSING);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layer.getMap(getMapParamsGainIs2, ApiType.PROCESSING);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layer.getMap(getMapParamsGammaIs2, ApiType.PROCESSING);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layer.getMap(getMapParamsGainGammaAre2, ApiType.PROCESSING);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};
