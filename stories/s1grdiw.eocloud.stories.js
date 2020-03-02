import {
  S1GRDEOCloudLayer,
  CRS_EPSG3857,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  DATASET_EOCLOUD_S1GRD,
  OrbitDirection,
  AcquisitionMode,
  Polarization,
  Resolution,
  LayersFactory,
} from '../dist/sentinelHub.esm';

if (!process.env.EOC_INSTANCE_ID) {
  throw new Error("EOC_INSTANCE_ID environment variable is not defined!");
};

if (!process.env.EOC_S1GRDIW_LAYER_ID) {
  throw new Error("EOC_S1GRDIW_LAYER_ID environment variable is not defined!");
};

const instanceId = process.env.EOC_INSTANCE_ID;
const layerId = process.env.EOC_S1GRDIW_LAYER_ID;
const bbox = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);
const bbox4326 = new BBox(CRS_EPSG4326, 13.359375, 43.0688878, 14.0625, 43.5803908);

export default {
  title: 'Sentinel 1 GRD IW - EOCloud',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>GetMapUrl (WMS)</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const layer = new S1GRDEOCloudLayer(instanceId, layerId, null, null, null, null, AcquisitionMode.IW, Polarization.DV, Resolution.HIGH);

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
  wrapperEl.innerHTML = "<h2>GetMap with WMS</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    const layer = new S1GRDEOCloudLayer(instanceId, layerId, null, null, null, null, AcquisitionMode.IW, Polarization.DV, Resolution.HIGH);

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
  wrapperEl.innerHTML = "<h2>GetMap with WMS</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    const layer = (await LayersFactory.makeLayers(`${DATASET_EOCLOUD_S1GRD.shServiceHostname}v1/wms/${instanceId}`, (lId, datasetId) => (layerId === lId)))[0];

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
  wrapperEl.innerHTML = "<h2>GetMap with WMS - evalscript</h2>";
  wrapperEl.insertAdjacentElement("beforeend", img);

  const perform = async () => {
    const layer = new S1GRDEOCloudLayer(
      instanceId,
      layerId,
      `
        return [2.5 * VV, 1.5 * VV, 0.5 * VV];
      `,
      null, null, null, AcquisitionMode.IW, Polarization.DV, Resolution.HIGH
    );

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

export const findTilesEPSG3857 = () => {
  const layer = new S1GRDEOCloudLayer(
    instanceId,
    layerId,
    null,
    null,
    null,
    null,
    AcquisitionMode.IW,
    Polarization.DV,
    OrbitDirection.ASCENDING,
  );
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>findTiles - BBox in EPSG:3857</h2>";
  wrapperEl.insertAdjacentElement("beforeend", containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      null,
      OrbitDirection.ASCENDING,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesEPSG4326 = () => {
  const layer = new S1GRDEOCloudLayer(
    instanceId,
    layerId,
    null,
    null,
    null,
    null,
    AcquisitionMode.IW,
    Polarization.DV,
    OrbitDirection.ASCENDING,
  );
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>findTiles - BBox in EPSG:4326</h2>";
  wrapperEl.insertAdjacentElement("beforeend", containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      null,
      OrbitDirection.ASCENDING,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findFlyovers = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = "<h2>findFlyovers</h2>";

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement("beforeend", img);

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement("beforeend", flyoversContainerEl);

  const perform = async () => {
    const layer = (await LayersFactory.makeLayers(`${DATASET_EOCLOUD_S1GRD.shServiceHostname}v1/wms/${instanceId}`, (lId, datasetId) => (layerId === lId)))[0];

    const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
    const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 6, 59, 59));
    const flyovers = await layer.findFlyovers(
      bbox4326,
      fromTime,
      toTime,
      20,
      50,
    );
    flyoversContainerEl.innerHTML = JSON.stringify(flyovers, null, true)

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

function renderTilesList(containerEl, list) {
  list.forEach(tile => {
    const ul = document.createElement('ul');
    containerEl.appendChild(ul);
    for (let key in tile) {
      const li = document.createElement('li');
      ul.appendChild(li);
      let text;
      if (tile[key] instanceof Object) {
        text = JSON.stringify(tile[key]);
      } else {
        text = tile[key];
      }
      li.innerHTML = `${key} : ${text}`;
    }
  });
}
