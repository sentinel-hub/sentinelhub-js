import { renderTilesList } from './storiesUtils';

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
  LayersFactory,
} from '../dist/sentinelHub.esm';

if (!process.env.EOC_INSTANCE_ID) {
  throw new Error('EOC_INSTANCE_ID environment variable is not defined!');
}

if (!process.env.EOC_S1GRDIW_LAYER_ID) {
  throw new Error('EOC_S1GRDIW_LAYER_ID environment variable is not defined!');
}

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
  wrapperEl.innerHTML = '<h2>GetMapUrl (WMS)</h2>';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
  });

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
    const layer = new S1GRDEOCloudLayer({
      instanceId,
      layerId,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      orbitDirection: OrbitDirection.ASCENDING,
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
        `${DATASET_EOCLOUD_S1GRD.shServiceHostname}v1/wms/${instanceId}`,
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
    const layer = new S1GRDEOCloudLayer({
      instanceId,
      layerId,
      evalscript: `
        return [2.5 * VV, 1.5 * VV, 0.5 * VV];
      `,
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      orbitDirection: OrbitDirection.ASCENDING,
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

export const findTilesEPSG3857 = () => {
  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles - BBox in EPSG:3857</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const data = await layer.findTiles(
      bbox,
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

export const findTilesEPSG4326 = () => {
  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
  });
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findTiles - BBox in EPSG:4326</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
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
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findFlyovers</h2>';

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const flyoversContainerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', flyoversContainerEl);

  const perform = async () => {
    const layer = (
      await LayersFactory.makeLayers(
        `${DATASET_EOCLOUD_S1GRD.shServiceHostname}v1/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];

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

export const findDatesUTCEPSG4326 = () => {
  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
  });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findDatesUTC - BBox in EPSG:4326</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const dates = await layer.findDatesUTC(
      bbox4326,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    );
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

export const findDatesUTCEPSG3857 = () => {
  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
  });

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>findDatesUTC - BBox in EPSG:3857</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    const dates = await layer.findDatesUTC(
      bbox,
      new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
      new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    );

    containerEl.innerHTML = JSON.stringify(dates, null, true);

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox,
      fromTime: dates[0],
      toTime: dates[0],
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

export const supportsProcessingAPI = () => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Supports Processing API</h2>';

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    const layer = (
      await LayersFactory.makeLayers(
        `${DATASET_EOCLOUD_S1GRD.shServiceHostname}v1/wms/${instanceId}`,
        (lId, datasetId) => layerId === lId,
      )
    )[0];
    const supportsProcessingAPI = layer.supportsApiType(ApiType.PROCESSING);
    containerEl.innerHTML = JSON.stringify(supportsProcessingAPI, null, true);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const statsAndHistogram = () => {
  const wrapperEl = document.createElement('div');
  const containerEl = document.createElement('pre');
  wrapperEl.innerHTML = '<h2>getStatsAndHistogram</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
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
  };

  const payload = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    binAmount: 10,
    histogramType: 'EQUALFREQUENCY',
    geometry: geometry,
    crs: CRS_EPSG4326,
  };

  const perform = async () => {
    const stats = await layer.getStatsAndHistogram(payload);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});
  return wrapperEl;
};


export const statsAndHistogramWithEvalscript = () => {
  const wrapperEl = document.createElement('div');
  const containerEl = document.createElement('pre');
  wrapperEl.innerHTML = '<h2>getStatsAndHistogram</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const layer = new S1GRDEOCloudLayer({
    instanceId,
    layerId,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    orbitDirection: OrbitDirection.ASCENDING,
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
  };

  const payload = {
    fromTime: new Date(Date.UTC(2020, 1 - 1, 1, 0, 0, 0)),
    toTime: new Date(Date.UTC(2020, 1 - 1, 15, 23, 59, 59)),
    resolution: 10,
    binAmount: 10,
    histogramType: 'EQUALFREQUENCY',
    geometry: geometry,
    crs: CRS_EPSG4326,
    evalscript: btoa(`return [(4*VH)/(VV+VH)];`),
  };

  const perform = async () => {
    const stats = await layer.getStatsAndHistogram(payload);
    containerEl.innerHTML = JSON.stringify(stats, null, true);
  };
  perform().then(() => {});
  return wrapperEl;
};
