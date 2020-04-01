import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  ProcessingDataFusionLayer,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  S2L1CLayer,
  S2L2ALayer,
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
const layerS2L1CId = process.env.S2L1C_LAYER_ID;
const layerS2L2AId = process.env.S2L2A_LAYER_ID;
const bbox = new BBox(
  CRS_EPSG3857,
  1761109.131690461,
  4833266.172528266,
  1780677.0109314662,
  4852834.051769271,
);

export default {
  title: 'Data fusion - Sentinel-2 L1C and Landsat 8',
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

    const layerS2L1C = new S2L1CLayer({ instanceId, layerId: layerS2L1CId });
    const layerS2L2A = new S2L2ALayer({ instanceId, layerId: layerS2L2AId });
    const layers = [
      {
        layer: layerS2L2A,
        id: 'l2a',
        fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        toTime: new Date(Date.UTC(2020, 2 - 1, 26, 0, 0, 0)),
      },
      {
        layer: layerS2L1C,
        id: 'l1c',
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
            {datasource: "l2a", bands:["B02", "B03", "B04"], units: "REFLECTANCE", mosaicking: "ORBIT"},
            {datasource: "l1c", bands:["B02", "B03", "B04"], units:"REFLECTANCE"}],
          output: [
            {id: "default", bands: 3, sampleType: SampleType.AUTO}
          ]
        });


        function evaluatePixel(samples, inputData, inputMetadata, customData, outputMetadata) {
          var sample = samples.l2a[0];
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
