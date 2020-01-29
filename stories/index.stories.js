import {
  LayersFactory,
  WmsLayer,
  S1GRDIWAWSLayer,
  S2L2ALayer,
  setAuthToken,
  isAuthTokenSet,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  Polarization,
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
  title: 'Demo',
};

export const S2GetMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const layerS2L2A = new S2L2ALayer(instanceId, s2l2aLayerId);

  const bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22);
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
    maxCCPercent: 50,
  };
  const imageUrl = layerS2L2A.getMapUrl(getMapParams, ApiType.WMS);
  img.src = imageUrl;

  return img;
};

export const S2GetMap = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  // getMap is async:
  const perform = async () => {
    const layerS2L2A = new S2L2ALayer(instanceId, s2l2aLayerId);

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      maxCCPercent: 100,
    };
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return img;
};

export const S2GetMapProcessing = () => {
  if (!process.env.STORYBOOK_AUTH_TOKEN) {
    return '<div>Please set auth token for Processing API (STORYBOOK_AUTH_TOKEN env var)</div>';
  }
  setAuthToken(process.env.STORYBOOK_AUTH_TOKEN);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  // getMap is async:
  const perform = async () => {
    const layerS2L2A = new S2L2ALayer(
      instanceId,
      s2l2aLayerId,
      `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
      }
    `,
    );

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      maxCCPercent: 100,
    };
    const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return img;
};

export const S1GetMapProcessingFromLayer = () => {
  if (!process.env.STORYBOOK_AUTH_TOKEN) {
    return '<div>Please set auth token for Processing API (STORYBOOK_AUTH_TOKEN env var)</div>';
  }
  setAuthToken(process.env.STORYBOOK_AUTH_TOKEN);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  // getMap is async:
  const perform = async () => {
    const layer = new S1GRDIWAWSLayer(instanceId, 'S1GRDIWDV');

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
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

  return img;
};

export const WmsGetMap = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  // getMap is async:
  const perform = async () => {
    const layer = new WmsLayer(
      'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
      'PROBAV_S1_TOA_333M',
    );

    const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0)), // 2020-01-10/2020-01-10
      toTime: new Date(Date.UTC(2020, 1 - 1, 10, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return img;
};

export const S2FindTiles = () => {
  const layerS2L2A = new S2L2ALayer(instanceId, 'S2L2A');
  const bbox = new BBox(CRS_EPSG4326, 11.9, 12.34, 42.05, 42.19);
  const containerEl = document.createElement('pre');
  const perform = async () => {
    const data = await layerS2L2A.findTiles(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      null,
      60,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return containerEl;
};

export const S1GRDFindTiles = () => {
  const layerS1 = new S1GRDIWAWSLayer(instanceId, 'layerId', null, null, null, null, null, Polarization.DV);
  const bbox = new BBox(CRS_EPSG4326, 11.9, 12.34, 42.05, 42.19);
  const containerEl = document.createElement('pre');
  const perform = async () => {
    const data = await layerS1.findTiles(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 10, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
      'ASCENDING',
    );

    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return containerEl;
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
