import { renderTilesList, setAuthTokenWithOAuthCredentials } from './storiesUtils';

import { BYOCLayer, CRS_EPSG3857, BBox, MimeTypes, ApiType, LocationIdSHv3 } from '../dist/sentinelHub.esm';

if (!process.env.INSTANCE_ID) {
  throw new Error('INSTANCE_ID environment variable is not defined!');
}

if (!process.env.BYOC_LAYER_ID) {
  throw new Error('BYOC_LAYER_ID environment variable is not defined!');
}

const instanceId = process.env.INSTANCE_ID;
const layerId = process.env.BYOC_LAYER_ID;

const bbox = new BBox(
  CRS_EPSG3857,
  process.env.BYOC_BBOX_EPSG3857_MINX ? process.env.BYOC_BBOX_EPSG3857_MINX : 1252344.271424327,
  process.env.BYOC_BBOX_EPSG3857_MINY ? process.env.BYOC_BBOX_EPSG3857_MINY : 5165920.119625352,
  process.env.BYOC_BBOX_EPSG3857_MAXX ? process.env.BYOC_BBOX_EPSG3857_MAXX : 1330615.7883883484,
  process.env.BYOC_BBOX_EPSG3857_MAXY ? process.env.BYOC_BBOX_EPSG3857_MAXY : 5244191.636589374,
);

const gain = 2;
const gamma = 2;

export default {
  title: 'BYOC with v3 script',
};

export const getMapURL = () => {
  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new BYOCLayer({ instanceId, layerId, locationId: LocationIdSHv3.awsEuCentral1 });

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2019, 11 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 1, 23, 59, 59)),
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
    await setAuthTokenWithOAuthCredentials();
    const layer = new BYOCLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2016, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2018, 2 - 1, 1, 23, 59, 59)),
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

    const layer = new BYOCLayer({
      instanceId,
      layerId,
      evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["IR", "G", "B"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [sample.IR/255, sample.G/255, sample.B/255];
      }
    `,
    });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
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

    const layer = new BYOCLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 2 - 1, 22, 23, 59, 59)),
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
  wrapperEl.innerHTML = '<h2>BYOC getMapURLGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    const layer = new BYOCLayer({ instanceId, layerId, locationId: LocationIdSHv3.awsEuCentral1 });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 1, 23, 59, 59)),
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
  wrapperEl.innerHTML = '<h2>BYOC getMapWMSGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const layer = new BYOCLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 1, 23, 59, 59)),
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

export const getMapProcessingGainGamma = () => {
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
  wrapperEl.innerHTML = '<h2>BYOC getMapProcessingGainGamma</h2>';
  wrapperEl.innerHTML += '<h4>no gain/gamma | gain | gamma | gain and gamma</h4>';
  wrapperEl.insertAdjacentElement('beforeend', imgNoGainGamma);
  wrapperEl.insertAdjacentElement('beforeend', imgGainIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGammaIs2);
  wrapperEl.insertAdjacentElement('beforeend', imgGainGammaAre2);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const layer = new BYOCLayer({ instanceId, layerId });

    const getMapParams = {
      bbox: bbox,
      fromTime: new Date(Date.UTC(2019, 11 - 1, 1, 0, 0, 0)),
      toTime: new Date(Date.UTC(2020, 1 - 1, 1, 23, 59, 59)),
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };

    const getMapParamsGainIs2 = { ...getMapParams, effects: { gain: gain } };
    const getMapParamsGammaIs2 = { ...getMapParams, effects: { gamma: gamma } };
    const getMapParamsGainGammaAre2 = { ...getMapParams, effects: { gain: gain, gamma: gamma } };

    try {
      const imageBlobNoGainGamma = await layer.getMap(getMapParams, ApiType.PROCESSING);
      imgNoGainGamma.src = URL.createObjectURL(imageBlobNoGainGamma);

      const imageBlobGainIs2 = await layer.getMap(getMapParamsGainIs2, ApiType.PROCESSING);
      imgGainIs2.src = URL.createObjectURL(imageBlobGainIs2);

      const imageBlobGammaIs2 = await layer.getMap(getMapParamsGammaIs2, ApiType.PROCESSING);
      imgGammaIs2.src = URL.createObjectURL(imageBlobGammaIs2);

      const imageBlobGainGamaAre2 = await layer.getMap(getMapParamsGainGammaAre2, ApiType.PROCESSING);
      imgGainGammaAre2.src = URL.createObjectURL(imageBlobGainGamaAre2);
    } catch (err) {
      wrapperEl.innerHTML += '<pre>ERROR OCCURED: ' + err + '</pre>';
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTiles = () => {
  if (!process.env.BYOC_COLLECTION_ID) {
    throw new Error('BYOC_COLLECTION_ID environment variable is not defined!');
  }
  const layer = new BYOCLayer({
    instanceId,
    layerId,
    collectionId: process.env.BYOC_COLLECTION_ID,
    locationId: LocationIdSHv3.awsEuCentral1,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles (with collectionId and locationId)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2016, 1 - 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findTilesAuth = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }

  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles (without collectionId and locationId)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const layer = new BYOCLayer({ instanceId, layerId });

    const data = await layer.findTiles(
      bbox,
      new Date(Date.UTC(2016, 1 - 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
      5,
      0,
    );
    renderTilesList(containerEl, data.tiles);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const findDatesUTC = () => {
  if (!process.env.BYOC_COLLECTION_ID) {
    throw new Error('BYOC_COLLECTION_ID environment variable is not defined!');
  }
  const layer = new BYOCLayer({
    instanceId,
    layerId,
    collectionId: process.env.BYOC_COLLECTION_ID,
    locationId: LocationIdSHv3.awsEuCentral1,
  });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findDatesUTC (with collectionId and locationId)</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const dates = await layer.findDatesUTC(
      bbox,
      new Date(Date.UTC(2016, 1 - 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    );
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

export const findDatesUTCAuth = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for Processing API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const layer = new BYOCLayer({ instanceId, layerId });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findDatesUTC (without collectionId and locationId)</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    const dates = await layer.findDatesUTC(
      bbox,
      new Date(Date.UTC(2016, 1 - 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    );
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
