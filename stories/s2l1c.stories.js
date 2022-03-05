import { createFindDatesUTCStory, renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';
import { setAuthToken } from '../dist/sentinelHub.esm';

import {
  S2L1CLayer,
  CRS_EPSG4326,
  CRS_EPSG3857,
  CRS_WGS84,
  BBox,
  MimeTypes,
  ApiType,
  PreviewMode,
  CancelToken,
  isCancelled,
  CacheTarget,
} from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.S2L1C_LAYER_ID) {
  throw new Error('S2L1C_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.S2L1C_LAYER_ID;
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.2, 12.7, 43);
const bbox3857 = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);

export default {
  title: 'Sentinel 2 L1C',
};

export const GetMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS) for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layerS2L1C = new S2L1CLayer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox4326,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
    preview: PreviewMode.DETAIL,
  };
  const imageUrl = layerS2L1C.getMapUrl(getMapParams, ApiType.WMS);
  img.src = imageUrl;

  return wrapperEl;
};

export const GetMapWMS = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMap with WMS for Sentinel-2 L2A</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  // getMap is async:
  const perform = async () => {
    const layerS2L1C = new S2L1CLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layerS2L1C.getMap(getMapParams, ApiType.WMS);
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

    const layerS2L1C = new S2L1CLayer({
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
        return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
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
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
      preview: PreviewMode.EXTENDED_PREVIEW,
    };
    const imageBlob = await layerS2L1C.getMap(getMapParams, ApiType.PROCESSING, reqConfig);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetMapWMSMaxCC20vs60 = () => {
  const layerS2L1C20 = new S2L1CLayer({ instanceId, layerId, maxCloudCoverPercent: 20 });
  const layerS2L1C60 = new S2L1CLayer({ instanceId, layerId, maxCloudCoverPercent: 60 });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>GetMap: maxCC=20 vs maxCC=60</h2>`;

  const img20 = document.createElement('img');
  img20.width = '512';
  img20.height = '512';
  img20.style.border = '2px solid green';
  img20.style.margin = '10px';
  wrapperEl.insertAdjacentElement('beforeend', img20);

  const img60 = document.createElement('img');
  img60.width = '512';
  img60.height = '512';
  img60.style.border = '2px solid blue';
  img60.style.margin = '10px';
  wrapperEl.insertAdjacentElement('beforeend', img60);

  const perform = async () => {
    const getMapParams = {
      bbox: bbox4326,
      fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 15, 6, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const imageBlob20 = await layerS2L1C20.getMap(getMapParams, ApiType.WMS);
    img20.src = URL.createObjectURL(imageBlob20);

    const imageBlob60 = await layerS2L1C60.getMap(getMapParams, ApiType.WMS);
    img60.src = URL.createObjectURL(imageBlob60);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const FindTilesSearchIndex = () => {
  const maxCloudCoverPercent = 60;
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findTiles for Sentinel-2 L1C; maxcc = ${maxCloudCoverPercent}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    setAuthToken(null);

    const data = await layerS2L1C.findTiles(
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

export const FindTilesCatalog = () => {
  const maxCloudCoverPercent = 10;
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findTiles for Sentinel-2 L1C; maxcc = ${maxCloudCoverPercent}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const data = await layerS2L1C.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      15,
      0,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const FindCachedToMemoryTiles = () => {
  const maxCloudCoverPercent = 60;
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findTiles for Sentinel-2 L1C; maxcc = ${maxCloudCoverPercent}</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);
  const requestsConfig = {
    cache: {
      expiresIn: 5000,
      targets: [CacheTarget.MEMORY],
    },
  };

  const perform = async () => {
    const data = await layerS2L1C.findTiles(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
      requestsConfig,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findFlyovers = () => {
  const layer = new S2L1CLayer({ instanceId, layerId });

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
    const fromTime = new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0));
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
    new S2L1CLayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 20,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),

    false,
  );
export const findDatesUTCCatalog = () =>
  createFindDatesUTCStory(
    new S2L1CLayer({
      instanceId,
      layerId,
      maxCloudCoverPercent: 20,
    }),
    bbox4326,
    new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    true,
  );

export const stats = () => {
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
  });

  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [38.443522453308105, 29.97140509632656],
        [38.44244956970215, 29.96954625480396],
        [38.44292163848877, 29.967538666899472],
        [38.44480991363525, 29.965865645995088],
        [38.44686985015869, 29.96541950233024],
        [38.44910144805908, 29.96564257441305],
        [38.45056056976318, 29.966720749087546],
        [38.451247215270996, 29.96861682100166],
        [38.450989723205566, 29.97006673393574],
        [38.450260162353516, 29.971330743333375],
        [38.4486722946167, 29.97229732790467],
        [38.44622611999512, 29.972446032388678],
        [38.444252014160156, 29.971888389426],
        [38.443522453308105, 29.97140509632656],
      ],
    ],
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
  };

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L1C;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    bins: 10,
    geometry: geometry,
  };
  const perform = async () => {
    const stats = await layerS2L1C.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const statsBBOX3857 = () => {
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
  });

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats for S2L1C;</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const params = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 200,
    bins: 10,
    geometry: bbox3857.toGeoJSON(),
  };
  const perform = async () => {
    const stats = await layerS2L1C.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const cancelRequests = () => {
  const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
    maxCloudCoverPercent: 20,
  });

  const getMapParams = {
    bbox: bbox4326,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };

  const containerEl = document.createElement('pre');
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>Cancel Requests example</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const button = document.createElement('button');
  button.innerHTML = 'Start Request';
  const button2 = document.createElement('button');
  button2.innerHTML = 'Cancel Request';
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', button);
  wrapperEl.insertAdjacentElement('beforeend', button2);
  wrapperEl.insertAdjacentElement('beforeend', img);

  let token;

  button.addEventListener('click', async () => {
    token = new CancelToken();
    img.src = '';
    try {
      const imageBlob = await layerS2L1C.getMap(getMapParams, ApiType.PROCESSING, {
        cancelToken: token,
      });
      img.src = URL.createObjectURL(imageBlob);
    } catch (err) {
      if (!isCancelled(err)) {
        throw err;
      }
    }
  });

  button2.addEventListener('click', () => {
    token.cancel();
  });
  const setToken = async () => {
    await setAuthTokenWithOAuthCredentials();
  };
  setToken();
  return wrapperEl;
};


export const getStatsGeoJSONDifferentCRS = () => {
  // GeoJSON is in CRS:84. Use geometry with longitude > 90, so switched coordinates aren't valid
const geometry = {
        "type": "Polygon",
        "coordinates": [
          [
            [
              131.8359375,
              50.958426723359935
            ],
            [
              144.755859375,
              50.958426723359935
            ],
            [
              144.755859375,
              57.468589192089354
            ],
            [
              131.8359375,
              57.468589192089354
            ],
            [
              131.8359375,
              50.958426723359935
            ]
          ]
        ]
      }
     const layerS2L1C = new S2L1CLayer({
    instanceId,
    layerId,
  });

     const wrapperElCRS84 = document.createElement('div');
     const wrapperElEPSG426 = document.createElement('div');
     wrapperElEPSG426.innerHTML = `<h4>Request with EPSG:4326. Should return an empty object.</h4>`;
     wrapperElCRS84.innerHTML = `<h4>Request with CRS:84. Should return results.</h4>`;

      const containerElCRS84 = document.createElement('pre');
     const containerElEPSG426 = document.createElement('pre');
     wrapperElCRS84.insertAdjacentElement('beforeend', containerElCRS84);
     wrapperElEPSG426.insertAdjacentElement('beforeend', containerElEPSG426)
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats using GeoJSON with correct (CRS:84) and incorrect (EPSG:4326) crs</h2>`;
  wrapperEl.insertAdjacentElement('beforeend', wrapperElEPSG426);
  wrapperEl.insertAdjacentElement('beforeend', wrapperElCRS84);
  


     const fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
const toTime= new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));

const getStatsParams = {
       fromTime: fromTime,
       toTime: toTime,
       geometry: geometry,
       resolution: 20000,
          bins: 1,
     }
     const perform = async () => {
  
     getStatsParams['crs'] = CRS_EPSG4326
     const statsESPG4326 = await layerS2L1C.getStats(getStatsParams)
     containerElEPSG426.innerHTML = JSON.stringify(statsESPG4326,null, 4);

     getStatsParams['crs'] = CRS_WGS84
     const statsCRS84 = await layerS2L1C.getStats(getStatsParams)
     containerElCRS84.innerHTML = JSON.stringify(statsCRS84,null, 4);
   }

     perform().then(() => {});

     return wrapperEl;
}
