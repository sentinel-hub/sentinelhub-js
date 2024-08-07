(await import('dotenv')).config({ path: '../../.env' });

import {
  LayersFactory,
  WmsLayer,
  S1GRDAWSEULayer,
  S2L2ALayer,
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  CRS_EPSG4326,
  BBox,
  MimeTypes,
  ApiType,
  setDebugEnabled,
  CancelToken,
  isCancelled,
} from '../../dist/sentinelHub.esm.js';

function printOut(title, value) {
  console.log(`\n${'='.repeat(10)}\n${title}`, JSON.stringify(value, null, 4));
}

async function setAuthTokenWithOAuthCredentials() {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    printOut(
      'Other examples need an auth token. Set env vars CLIENT_ID and CLIENT_SECRET and run again.',
      null,
    );
    return;
  }

  if (isAuthTokenSet()) {
    printOut('Auth token is already set.');
    return;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  printOut('Requesting auth token with client id from env vars:', clientId);

  const authToken = await requestAuthToken(clientId, clientSecret);
  printOut('Auth token retrieved successfully:', authToken);

  printOut('Auth token set:', isAuthTokenSet());
  setAuthToken(authToken);
  printOut('Auth token set:', isAuthTokenSet());
}

async function run() {
  if (!process.env.INSTANCE_ID) {
    printOut('Example needs instance id to run. Please set env var INSTANCE_ID and run again', null);
    return;
  }
  if (!process.env.S2L2A_LAYER_ID) {
    printOut(
      'Example needs id of Sentinel-2 L2A layer to run. Please set env var S2L2A_LAYER_ID and run again',
      null,
    );
    return;
  }
  if (!process.env.S1GRDIW_LAYER_ID) {
    printOut(
      'Example needs id of Sentinel-1 GRD layer to run. Please set env var S1GRDIW_LAYER_ID and run again',
      null,
    );
    return;
  }

  const instanceId = process.env.INSTANCE_ID;
  const baseUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;
  const s2l2aLayerId = process.env.S2L2A_LAYER_ID;
  const s1grdLayerId = process.env.S1GRDIW_LAYER_ID;

  // get the list of all of the layers:
  const layers = await LayersFactory.makeLayers(baseUrl);
  printOut(`Layers:`, layers);
  const layersIds = layers.map((l) => l.layerId);
  const layersTitles = layers.map((l) => l.title);
  const layersDescriptions = layers.map((l) => l.description);
  printOut(`Layers ids:`, layersIds);
  printOut(`Layers titles:`, layersTitles);
  printOut(`Layers descriptions:`, layersDescriptions);

  // layer can also be constructed directly:
  const layerId = layers[0].layerId; // take a layer that we know exists
  const layer = new WmsLayer({ baseUrl, layerId, title: 'My title', description: 'My desc' });
  printOut(`Layer title:`, layer.title);
  printOut('Layer description:', layer.description);

  await setAuthTokenWithOAuthCredentials();

  const layerS1 = new S1GRDAWSEULayer({ instanceId, layerId: s1grdLayerId });
  printOut('Layer:', { layerId: layerS1.layerId, title: layerS1.title });
  printOut('Orthorectify & backscatter:', { o: layerS1.orthorectify, b: layerS1.backscatterCoeff });

  // set the parameters for getting tiles, flyover intervals and images
  const bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22);
  printOut('BBox:', bbox);

  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };
  printOut('GetMapParams:', getMapParams);

  const maxCount = 20;
  printOut('maximum number of returned tiles is:', maxCount);

  // get tiles, flyover intervals and dates for S2 L2A layer
  const layerS2L2A = new S2L2ALayer({ instanceId, layerId: s2l2aLayerId });
  const { tiles: tilesS2L2A, hasMore } = await layerS2L2A.findTiles(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
    maxCount,
    0,
  );
  printOut('tiles for S2 L2A:', tilesS2L2A);
  printOut('hasMore:', hasMore);

  const flyoversS2L2A = await layerS2L2A.findFlyovers(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
    10,
    50,
  );
  printOut('flyovers for S2 L2A:', flyoversS2L2A);

  const datesS2L2A = await layerS2L2A.findDatesUTC(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
  );
  printOut('dates for S2 L2A', datesS2L2A);

  // get tiles, flyover intervals and dates for S1 GRD Layer
  const { tiles: tilesS1GRD, hasMore: hasMoreS1 } = await layerS1.findTiles(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
    maxCount,
    0,
  );
  printOut('tiles for S1 GRD:', tilesS1GRD);
  printOut('hasMore for S1:', hasMoreS1);

  const flyoversS1GRD = await layerS1.findFlyovers(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
    10,
    50,
  );
  printOut('flyovers for S1 GRD:', flyoversS1GRD);

  // from now on, write curl command of each request to console:
  setDebugEnabled(true);

  const datesS1GRD = await layerS1.findDatesUTC(
    getMapParams.bbox,
    getMapParams.fromTime,
    getMapParams.toTime,
  );
  printOut('dates for S1 GRD', datesS1GRD);

  setDebugEnabled(false);

  // finally, display the image:
  const imageUrl = layerS2L2A.getMapUrl(getMapParams, ApiType.WMS);
  printOut('URL of S2 L2A image:', imageUrl);

  const layerS2L2AWithEvalscript = new S2L2ALayer({
    instanceId,
    layerId: s2l2aLayerId,
    evalscript: 'return [B02, B03, B04];',
  });
  const imageUrl2 = layerS2L2AWithEvalscript.getMapUrl(getMapParams, ApiType.WMS);
  printOut('URL of S2 L2A image with evalscript:', imageUrl2);

  // write the satellite image to JPG file:
  const fs = require('fs');
  const imageBlob = await layerS2L2A.getMap(getMapParams, ApiType.WMS);
  fs.writeFileSync('./image.jpeg', imageBlob, { encoding: null });

  // Cancel request example
  // Create source and pass token as config on the request (getMap WMS/Processing and getStats supported for layerV3)
  const token = new CancelToken();

  setTimeout(() => {
    printOut('Cancelling request');
    token.cancel();
  }, 100);

  try {
    const response = await layerS2L2A.getMap(getMapParams, ApiType.WMS, { cancelToken: token });
    console.log('Image was recieved before 100 miliseconds');
  } catch (err) {
    //The exception thrown by cancelling requests can be identified by isCancelled
    if (!isCancelled(err)) {
      throw err;
    }
  }
}

run()
  .then(() => {
    console.log('Done.');
  })
  .catch((ex) => {
    console.error(ex);
    process.exit(1);
  });
