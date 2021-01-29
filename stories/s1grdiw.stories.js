import { createFindDatesUTCStory, renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';
import { setAuthToken } from '../dist/sentinelHub.esm';

import {
  S1GRDAWSEULayer,
  CRS_EPSG4326,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  AcquisitionMode,
  Polarization,
  Resolution,
  OrbitDirection,
  BackscatterCoeff,
  demInstanceType,
  DATASET_AWSEU_S1GRD,
  LayersFactory,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S1GRDIW_LAYER_ID) {
  throw new Error('S1GRDIW_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S1GRDIW_LAYER_ID;

const bbox3857 = new BBox(CRS_EPSG3857, 2115070.33, 2273030.93, 2226389.82, 2391878.59);
const bbox4326 = new BBox(CRS_EPSG4326, 13.359375, 43.0688878, 14.0625, 43.5803908);

export default {
  title: 'Sentinel 1 GRD IW - AWS',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new S1GRDAWSEULayer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox3857,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };
  const imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);
  img.src = imageUrl;

  return wrapperEl;
};

export const getMapWMS = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = new S1GRDAWSEULayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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

export const getMapWMSLayersFactory = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = (
      await LayersFactory.makeLayers(
        `${DATASET_AWSEU_S1GRD.shServiceHostname}ogc/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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

export const getMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({
      instanceId,
      layerId,
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["VV"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.VV, 2.5 * sample.VV, 2.5 * sample.VV];
      }
    `,
    });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingWithoutInstance = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["VV"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.VV, 2.5 * sample.VV, 2.5 * sample.VV];
      }
    `,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingWithoutInstanceRTC = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing Radiometric Terrain Correction</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["VV"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.VV, 2.5 * sample.VV, 2.5 * sample.VV];
      }
    `,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
      backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
      orthorectify: true,
      demInstanceType: demInstanceType.MAPZEN,
    });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapProcessingFromLayer = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox3857,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
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
  wrapperEl.innerHTML = '<h2>GetMap with Processing setting evalscriptUrl with v2 script</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new S1GRDAWSEULayer({
      instanceId,
      layerId,
      evalscriptUrl:
        'https://raw.githubusercontent.com/sentinel-hub/custom-scripts/cf4930ae0dd6d155f80ff311d6d862ca28de412b/sentinel-1/sar_for_deforestation/script.js',
    });

    const getMapParams = {
      bbox: new BBox(
        CRS_EPSG4326,
        12.089080810546877,
        44.625908121970454,
        12.250614166259767,
        44.74210015957899,
      ),
      fromTime: new Date(Date.UTC(2018, 8 - 1, 28, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 8 - 1, 28, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesEPSG3857SearchIndex = () => {
  const layer = new S1GRDAWSEULayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });

  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    setAuthToken(null);
    const data = await layer.findTiles(
      bbox3857,
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

export const findTilesEPSG4326SearchIndex = () => {
  const layer = new S1GRDAWSEULayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    setAuthToken(null);
    const data = await layer.findTiles(
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

export const findTilesEPSG4326Catalog = () => {
  const layer = new S1GRDAWSEULayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });

  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const data = await layer.findTiles(
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

export const findFlyovers = () => {
  const layer = new S1GRDAWSEULayer({ instanceId, layerId });

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
    const fromTime = new Date(Date.UTC(2020, 1 - 1, 15, 0, 0, 0));
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
    new S1GRDAWSEULayer({
      instanceId,
      layerId,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    false,
  );
export const findDatesUTCCatalog = () =>
  createFindDatesUTCStory(
    new S1GRDAWSEULayer({
      instanceId,
      layerId,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    true,
  );

export const supportsProcessingAPI = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Supports Processing API</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const layer = (
      await LayersFactory.makeLayers(
        `${DATASET_AWSEU_S1GRD.shServiceHostname}ogc/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];
    const supportsProcessingAPI = layer.supportsApiType(ApiType.PROCESSING);
    containerEl.innerHTML = JSON.stringify(supportsProcessingAPI, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};
