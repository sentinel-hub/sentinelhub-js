import { renderTilesList } from './storiesUtils';

import {
  Landsat8AWSLayer,
  CRS_EPSG3857,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  LayersFactory,
  DATASET_AWS_L8L1C,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.LANDSAT8_LAYER_ID) {
  throw new Error('LANDSAT8_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.LANDSAT8_LAYER_ID;
const bbox = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

export default {
  title: 'Landsat 8 - AWS',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new Landsat8AWSLayer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox,
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
    const layer = new Landsat8AWSLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
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
        `${DATASET_AWS_L8L1C.shServiceHostname}ogc/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];

    const getMapParams = {
      bbox: bbox,
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

export const getMapWMSEvalscript = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS - evalscript</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = new Landsat8AWSLayer({
      instanceId,
      layerId,
      evalscript: `
        return [2.5 * B04, 1.5 * B03, 0.5 * B02];
      `,
    });

    const getMapParams = {
      bbox: bbox,
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

export const findTiles = () => {
  const layer = new Landsat8AWSLayer({ instanceId, layerId });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2000, 1 - 1, 1, 0, 0, 0)),
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
  const layer = new Landsat8AWSLayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
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

export const findDatesUTC = () => {
  const maxCloudCoverPercent = 40;
  const layer = new Landsat8AWSLayer({ instanceId, layerId, maxCloudCoverPercent });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findDatesUTC for Landsat 8 on AWS; maxcc = ${maxCloudCoverPercent}</h2>`;

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59));

  const perform = async () => {
    const dates = await layer.findDatesUTC(bbox, fromTime, toTime);
    containerEl.innerHTML = JSON.stringify(dates, null, true);

    const resDateStartOfDay = new Date(new Date(dates[0]).setUTCHours(0, 0, 0, 0));
    const resDateEndOfDay = new Date(new Date(dates[0]).setUTCHours(23, 59, 59, 999));

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox4326,
      fromTime: resDateStartOfDay,
      toTime: resDateEndOfDay,
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

export const stats = () => {
  const wrapperEl = document.createElement('div');
  const containerEl = document.createElement('pre');
  wrapperEl.innerHTML = '<h2>getStats</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const layer = new Landsat8AWSLayer({ instanceId, layerId:'L8-NDVI', maxCloudCoverPercent: 100 });

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 350,
    binAmount: 10,
    geometry: bbox4326.toGeoJSON(),
    crs: CRS_EPSG4326,
  };

  const perform = async () => {
    const stats = await layer.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});
  return wrapperEl;
};