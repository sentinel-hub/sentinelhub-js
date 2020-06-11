import { renderTilesList } from './storiesUtils';

import {
  EnvisatMerisEOCloudLayer,
  CRS_EPSG3857,
  BBox,
  MimeTypes,
  ApiType,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  LayersFactory,
  CRS_EPSG4326,
} from '../dist/sentinelHub.esm';

if (!process.env.EOC_INSTANCE_ID) {
  throw new Error('EOC_INSTANCE_ID environment variable is not defined!');
}

if (!process.env.EOC_ENVISATMERIS_LAYER_ID) {
  throw new Error('EOC_ENVISATMERIS_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.EOC_INSTANCE_ID;
const layerId = process.env.EOC_ENVISATMERIS_LAYER_ID;
const bbox = new BBox(CRS_EPSG3857, 1487158.82, 5322463.15, 1565430.34, 5400734.67);
const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

const gain = 2;
const gamma = 2;

export default {
  title: 'Envisat Meris - EOCloud',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
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
    const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
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
        `${DATASET_EOCLOUD_ENVISAT_MERIS.shServiceHostname}v1/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
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
    const layer = new EnvisatMerisEOCloudLayer({
      instanceId,
      layerId,
      evalscript: `
        return [2.5 * B04, 1.5 * B03, 0.5 * B02];
      `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
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

export const getMapURLGainGamma = () => {
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
  wrapperEl.innerHTML = '<h2>Envisat Meris getMapURLGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

    try {
      const imageBlobNoGainGamma = await layer.getMapUrl(getMapParams, ApiType.WMS);
      imgNoGainGamma.src = imageBlobNoGainGamma;

      const imageBlobGainIs2 = await layer.getMapUrl(getMapParamsGainIs2, ApiType.WMS);
      imgGainIs2.src = imageBlobGainIs2;

      const imageBlobGammaIs2 = await layer.getMapUrl(getMapParamsGammaIs2, ApiType.WMS);
      imgGammaIs2.src = imageBlobGammaIs2;

      const imageBlobGainGamaAre2 = await layer.getMapUrl(getMapParamsGainGammaAre2, ApiType.WMS);
      imgGainGammaAre2.src = imageBlobGainGamaAre2;
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const getMapWMSGainGamma = () => {
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
  wrapperEl.innerHTML = '<h2>Envisat Meris getMapWMSGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2008, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2008, 12 - 1, 22, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

    try {
      const imageBlobNoGainGamma = await layer.getMap(getMapParams, ApiType.WMS);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layer.getMap(getMapParamsGainIs2, ApiType.WMS);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layer.getMap(getMapParamsGammaIs2, ApiType.WMS);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layer.getMap(getMapParamsGainGammaAre2, ApiType.WMS);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTiles = () => {
  const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });
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
  const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const fromTime = new Date(Date.UTC(2006, 1 - 1, 1, 0, 0, 0));
  const toTime = new Date(Date.UTC(2008, 1 - 1, 15, 23, 59, 59));

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
  const layer = new EnvisatMerisEOCloudLayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = `<h2>findDatesUTC - BBox in EPSG:3857; maxcc = ${maxCloudCoverPercent} </h2>`;

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
