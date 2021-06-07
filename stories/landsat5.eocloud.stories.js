import { renderTilesList } from './storiesUtils';

import {
  Landsat5EOCloudLayer,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  DATASET_EOCLOUD_LANDSAT5,
  LayersFactory,
  CRS_EPSG4326,
  CRS_WGS84
} from '../dist/sentinelHub.esm';

if (!process.env.EOC_INSTANCE_ID) {
  throw new Error('EOC_INSTANCE_ID environment variable is not defined!');
}

if (!process.env.EOC_LANDSAT5_LAYER_ID) {
  throw new Error('EOC_LANDSAT5_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.EOC_INSTANCE_ID;
const layerId = process.env.EOC_LANDSAT5_LAYER_ID;
const bbox = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

export default {
  title: 'Landsat 5 - EOCloud',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const maxCloudCoverPercent = 0;
  const layer = new Landsat5EOCloudLayer({ instanceId, layerId, maxCloudCoverPercent });

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
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
    const layer = new Landsat5EOCloudLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
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
        `${DATASET_EOCLOUD_LANDSAT5.shServiceHostname}v1/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
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

export const getMapWMSLayersFactoryOverrideConstructorParamsNull = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>makeLayers with overrideConstructorParams = null</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const layer = (
      await LayersFactory.makeLayers(
        `${DATASET_EOCLOUD_LANDSAT5.shServiceHostname}v1/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
        null,
      )
    )[0];
    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
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
    const layer = new Landsat5EOCloudLayer({
      instanceId,
      layerId,
      evalscript: `
        return [2.5 * B04, 1.5 * B03, 0.5 * B02];
      `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
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

export const GetMapWMSMaxCC20vs60 = () => {
  const layerL520 = new Landsat5EOCloudLayer({ instanceId, layerId, maxCloudCoverPercent: 20 });
  const layerL560 = new Landsat5EOCloudLayer({ instanceId, layerId, maxCloudCoverPercent: 60 });

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
      fromTime: new Date(Date.UTC(2010, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2010, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const imageBlob20 = await layerL520.getMap(getMapParams, ApiType.WMS);
    img20.src = URL.createObjectURL(imageBlob20);

    const imageBlob60 = await layerL560.getMap(getMapParams, ApiType.WMS);
    img60.src = URL.createObjectURL(imageBlob60);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTiles = () => {
  const layer = new Landsat5EOCloudLayer({ instanceId, layerId });
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
  const layer = new Landsat5EOCloudLayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const fromTime = new Date(Date.UTC(2000, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59));

  const perform = async () => {
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

export const findDatesUTCEPSG3857 = () => {
  const maxCloudCoverPercent = 60;
  const layer = new Landsat5EOCloudLayer({ instanceId, layerId, maxCloudCoverPercent });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findDatesUTC - BBox in EPSG:3857; maxcc = ${maxCloudCoverPercent}</h2>`;

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const fromTime = new Date(Date.UTC(2000, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59));

  const perform = async () => {
    const dates = await layer.findDatesUTC(bbox, fromTime, toTime);

    containerEl.innerHTML = JSON.stringify(dates, null, true);

    const resDateStartOfDay = new Date(new Date(dates[0]).setUTCHours(0, 0, 0, 0));
    const resDateEndOfDay = new Date(new Date(dates[0]).setUTCHours(23, 59, 59, 999));

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox,
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
  const maxCloudCoverPercent = 60;
  const layer = new Landsat5EOCloudLayer({ instanceId, layerId, maxCloudCoverPercent });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>getStats</h2>`;

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const fromTime = new Date(Date.UTC(2000, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2000, 3 - 1, 15, 23, 59, 59));

  const perform = async () => {
    const params = {
      fromTime: fromTime,
      toTime: toTime,
      resolution: 100,
      bins: 10,
      geometry: bbox.toGeoJSON(),
    };
    const stats = await layer.getStats(params);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};


export const getStatsGeoJSONDifferentCRS = () => {
  // GeoJSON is in CRS:84. Use geometry with longitude near 0, so switched coordinates outside of data availability
const geometry = {
        "type": "Polygon",
        "coordinates": [
          [
            [
              0.9860229492187499,
              48.86471476180277
            ],
            [
              1.0876464843749998,
              48.86471476180277
            ],
            [
              1.0876464843749998,
              48.922499263758255
            ],
            [
              0.9860229492187499,
              48.922499263758255
            ],
            [
              0.9860229492187499,
              48.86471476180277
            ]
          ]
        ]
      }
     const layer = new Landsat5EOCloudLayer({
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
  


     const fromTime = new Date(Date.UTC(2011, 1 - 1, 1, 0, 0, 0, 0));
const toTime= new Date(Date.UTC(2011, 5 - 1, 1, 23, 59, 59, 999));

const getStatsParams = {
       fromTime: fromTime,
       toTime: toTime,
       geometry: geometry,
       resolution: 200,
          bins: 1,
     }
     const perform = async () => {
  
     getStatsParams['crs'] = CRS_EPSG4326
     const statsESPG4326 = await layer.getStats(getStatsParams).catch(err => err)
     containerElEPSG426.innerHTML = JSON.stringify(statsESPG4326,null, 4);

     getStatsParams['crs'] = CRS_WGS84
     const statsCRS84 = await layer.getStats(getStatsParams).catch(err => err)
     containerElCRS84.innerHTML = JSON.stringify(statsCRS84,null, 4);
   }

     perform().then(() => {});

     return wrapperEl;
}