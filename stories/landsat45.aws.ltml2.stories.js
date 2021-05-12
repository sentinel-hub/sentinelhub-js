import { createFindDatesUTCStory, renderTilesList } from './storiesUtils';

import {
  Landsat45AWSLTML2Layer,
  CRS_EPSG3857,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  LayersFactory,
  DATASET_AWS_LTML2,
  setAuthToken,
  CacheTarget,
} from '../dist/sentinelHub.esm';

import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.LANDSAT45_LTML2_LAYER_ID) {
  throw new Error('LANDSAT45_LTML2_LAYER_ID environment variable is not defined!');
}

if (!process.env.LANDSAT45_LTML2_NDVI_LAYER_ID) {
  throw new Error('LANDSAT45_LTML2_NDVI_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.LANDSAT45_LTML2_LAYER_ID;
const layerIdNdvi = process.env.LANDSAT45_LTML2_NDVI_LAYER_ID;
const bbox = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);
const fromTime = new Date(Date.UTC(2011, 10 - 1, 22, 0, 0, 0));
const toTime = new Date(Date.UTC(2011, 11 - 1, 22, 23, 59, 59));

export default {
  title: 'Landsat 4-5 - TM L2',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox,
    fromTime: fromTime,
    toTime: toTime,
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
    const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
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
        `${DATASET_AWS_LTML2.shServiceHostname}ogc/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];

    const getMapParams = {
      bbox: bbox,
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

export const getMapWMSEvalscript = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS - evalscript</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = new Landsat45AWSLTML2Layer({
      instanceId,
      layerId,
      evalscript: `
        return [2.5 * B04, 1.5 * B03, 0.5 * B02];
      `,
    });

    const getMapParams = {
      bbox: bbox,
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

export const GetMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new Landsat45AWSLTML2Layer({
      instanceId,
      layerId,
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5*sample.B04, 2.5*sample.B03, 2.5*sample.B02];
      }
    `,
    });
    const reqConfig = {
      cache: {
        expiresIn: 5000,
        targets: [CacheTarget.MEMORY],
      },
    };

    const getMapParams = {
      bbox: bbox,
      fromTime: fromTime,
      toTime: toTime,
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING, reqConfig);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesSearchIndex = () => {
  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    setAuthToken(null);
    const data = await layer.findTiles(bbox4326, fromTime, toTime, 5, 0, { cache: { expiresIn: 0 } });
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesCatalog = () => {
  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const data = await layer.findTiles(bbox4326, fromTime, toTime, 5, 0, { cache: { expiresIn: 0 } });
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findFlyovers = () => {
  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const fromTime = new Date(Date.UTC(2000, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59));

  const perform = async () => {
    const flyovers = await layer.findFlyovers(bbox4326, fromTime, toTime, 50, 50);
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
    new Landsat45AWSLTML2Layer({ instanceId, layerId, maxCloudCoverPercent: 40 }),
    bbox4326,
    fromTime,
    toTime,
    false,
  );
export const findDatesUTCCatalog = () =>
  createFindDatesUTCStory(
    new Landsat45AWSLTML2Layer({ instanceId, layerId, maxCloudCoverPercent: 40 }),
    bbox4326,
    fromTime,
    toTime,
    true,
  );

export const stats = () => {
  const wrapperEl = document.createElement('div');
  const containerEl = document.createElement('pre');
  wrapperEl.innerHTML = '<h2>getStats</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId: layerIdNdvi, maxCloudCoverPercent: 100 });

  const params = {
    fromTime: fromTime,
    toTime: toTime,
    resolution: 350,
    bins: 10,
    geometry: bbox4326.toGeoJSON(),
  };

  const perform = async () => {
    const stats = await layer.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});
  return wrapperEl;
};

export const statsBBOX3857 = () => {
  const wrapperEl = document.createElement('div');
  const containerEl = document.createElement('pre');
  wrapperEl.innerHTML = '<h2>getStats for EPSG:3857</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const layer = new Landsat45AWSLTML2Layer({ instanceId, layerId: layerIdNdvi, maxCloudCoverPercent: 100 });

  const params = {
    fromTime: fromTime,
    toTime: toTime,
    resolution: 350,
    bins: 10,
    geometry: bbox.toGeoJSON(),
  };

  const perform = async () => {
    const stats = await layer.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});
  return wrapperEl;
};
