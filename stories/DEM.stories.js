import { createFindDatesUTCStory, renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  DEMLayer,
  DEMInstanceType,
  setAuthToken,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.DEM_MAPZEN_LAYER_ID) {
  throw new Error('DEM_MAPZEN environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.DEM_MAPZEN_LAYER_ID;
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

export default {
  title: 'DEM',
};

const defaultDEMEvalscript = `//VERSION=3
return colorBlend(DEM, [-12000,-9000,-5000,-1000,-500,-200,-50,-20,-10,0,10,30,50,200,300,400,500,1000,3000,5000,7000,9000], [
[0.000, 0.000, 0.000],
[0.020, 0.008, 0.000],
[0.059, 0.031, 0.008],
[0.098, 0.055, 0.016],
[0.137, 0.078, 0.024],
[0.176, 0.102, 0.031],
[0.235, 0.137, 0.039],
[0.314, 0.184, 0.055],
[0.353, 0.208, 0.063],
[0.392, 0.227, 0.067],
[0.431, 0.251, 0.075],
[0.510, 0.298, 0.090],
[0.549, 0.322, 0.098],
[0.627, 0.369, 0.110],
[0.706, 0.416, 0.125],
[0.784, 0.459, 0.137],
[0.843, 0.494, 0.149],
[0.882, 0.518, 0.157],
[0.922, 0.541, 0.161],
[0.961, 0.565, 0.169],
[0.980, 0.576, 0.173],
[1.000, 0.588, 0.176]])`;

const createDEMLayers = (
  wrapperEl,
  createImgPlaceholder = true,
  setDEMInstance = false,
  evalscript = null,
) => {
  const demLayers = [];
  Object.keys(DEMInstanceType).forEach(demInstance => {
    const layerId = process.env[`DEM_${demInstance}_LAYER_ID`];
    if (!layerId) {
      throw new Error(`DEM_${demInstance}_LAYER_ID environment variable is not defined!`);
    }
    const constructorParams = { instanceId, layerId };
    if (setDEMInstance) {
      constructorParams.demInstance = DEMInstanceType[demInstance];
    }
    if (evalscript) {
      constructorParams.evalscript = evalscript;
    }
    const layerDEM = new DEMLayer(constructorParams);
    const result = { layer: layerDEM, demInstance: DEMInstanceType[demInstance] };
    if (createImgPlaceholder) {
      const img = document.createElement('img');
      img.width = '256';
      img.height = '256';
      wrapperEl.insertAdjacentElement('beforeend', img);
      result.img = img;
    }
    demLayers.push(result);
  });
  return demLayers;
};

export const GetMapURL = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS) for DEM</h2>';
  wrapperEl.innerHTML += `<h4> ${Object.keys(DEMInstanceType).join('|')} </h4>`;
  const demLayers = createDEMLayers(wrapperEl);

  demLayers.map(demLayer => {
    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageUrl = demLayer.layer.getMapUrl(getMapParams, ApiType.WMS);
    demLayer.img.src = imageUrl;
  });

  return wrapperEl;
};

export const GetMapWMS = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for DEM</h2>';
  wrapperEl.innerHTML += `<h4> ${Object.keys(DEMInstanceType).join('|')} </h4>`;
  const demLayers = createDEMLayers(wrapperEl);

  // getMap is async:
  const perform = async () => {
    demLayers.map(async demLayer => {
      const getMapParams = {
        bbox: bbox4326,
        fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
        toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
        width: 512,
        height: 512,
        format: MimeTypes.JPEG,
      };
      const imageBlob = await demLayer.layer.getMap(getMapParams, ApiType.WMS);
      demLayer.img.src = URL.createObjectURL(imageBlob);
    });
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetMapProcessing = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing</h2>';
  wrapperEl.innerHTML += `<h4> ${Object.keys(DEMInstanceType).join('|')} </h4>`;
  const demLayers = createDEMLayers(wrapperEl, true, true, defaultDEMEvalscript);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    demLayers.map(async demLayer => {
      const getMapParams = {
        bbox: bbox4326,
        fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
        toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
        width: 256,
        height: 256,
        format: MimeTypes.JPEG,
      };
      const imageBlob = await demLayer.layer.getMap(getMapParams, ApiType.PROCESSING);
      demLayer.img.src = URL.createObjectURL(imageBlob);
    });
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetMapProcessingFromLayer = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with Processing from Layer</h2>';
  wrapperEl.innerHTML += `<h4> ${Object.keys(DEMInstanceType).join('|')} </h4>`;
  const demLayers = createDEMLayers(wrapperEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    demLayers.map(async demLayer => {
      const getMapParams = {
        bbox: bbox4326,
        fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
        toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
        width: 256,
        height: 256,
        format: MimeTypes.JPEG,
      };
      const imageBlob = await demLayer.layer.getMap(getMapParams, ApiType.PROCESSING);
      demLayer.img.src = URL.createObjectURL(imageBlob);
    });
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesSearchIndex = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  const demLayers = createDEMLayers(wrapperEl, false);
  const perform = async () => {
    demLayers.map(async demLayer => {
      setAuthToken(null);
      const data = await demLayer.layer.findTiles(
        bbox4326,
        new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
        5,
        0,
        { cache: { expiresIn: 0 } },
      );
      const containerElTitle = document.createElement('div');
      containerElTitle.innerHTML = demLayer.demInstance;
      wrapperEl.insertAdjacentElement('beforeend', containerElTitle);
      const containerEl = document.createElement('div');
      wrapperEl.insertAdjacentElement('beforeend', containerEl);
      renderTilesList(containerEl, data.tiles);
    });
  };

  perform().then(() => {});

  return wrapperEl;
};

export const findTilesCatalog = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles</h2>';
  const demLayers = createDEMLayers(wrapperEl, false);
  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    demLayers.map(async demLayer => {
      const data = await demLayer.layer.findTiles(
        bbox4326,
        new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
        new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
        5,
        0,
        { cache: { expiresIn: 0 } },
      );
      const containerElTitle = document.createElement('div');
      containerElTitle.innerHTML = demLayer.demInstance;
      wrapperEl.insertAdjacentElement('beforeend', containerElTitle);
      const containerEl = document.createElement('div');
      wrapperEl.insertAdjacentElement('beforeend', containerEl);
      renderTilesList(containerEl, data.tiles);
    });
  };

  perform().then(() => {});

  return wrapperEl;
};

export const findDatesUTCSearchIndex = () =>
  createFindDatesUTCStory(
    new DEMLayer({ instanceId, layerId, demInstance: 'MAPZEN' }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    false,
  );

export const findDatesUTCCatalog = () =>
  createFindDatesUTCStory(
    new DEMLayer({ instanceId, layerId, demInstance: 'MAPZEN' }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    true,
  );
