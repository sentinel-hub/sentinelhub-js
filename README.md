
- [Installation](#installation)
- [Usage](#usage)
  - [Layers](#layers)
  - [Fetching images](#fetching-images)
    - [Effects](#effects)
  - [Searching for data](#searching-for-data)
  - [Requests configuration](#requests-configuration)
  - [Getting basic statistics and histogram](#getting-basic-statistics-and-histogram)
  - [Backwards compatibility](#backwards-compatibility)
  - [Authentication for Processing API](#authentication-for-processing-api)
  - [Debugging](#debugging)
- [Examples](#examples)
  - [Preparation before running examples](#preparation-before-running-examples)
  - [Running examples](#running-examples)
    - [Node.js](#node.js)
    - [Storybook](#storybook)
- [Copyright and license](#copyright-and-license)

-----

# Installation

```
$ npm install @sentinel-hub/sentinelhub-js
```

# Usage

## Layers

The core data structure is `Layer`, which corresponds to a _layer_ as returned by OGC WMS GetCapabilities request. Basic (WMS-capable) `Layer` can be initialized like this:

```javascript
  import { WmsLayer } from '@sentinel-hub/sentinelhub-js';

  const layer = new WmsLayer({
    baseUrl: 'https://services.sentinel-hub.com/ogc/wms/<your-instance-id>',
    layerId: '<layer-id>',
  });
```

Such layer would only allow WMS requests. However, `Layer` is also a superclass for multiple dataset-specific subclasses (like `S1GRDAWSEULayer` - Sentinel-1 GRD data on AWS eu-central-1 Sentinel Hub endpoint) which can be instantiated with their own specific parameters and thus have additional capabilities.

When it comes to Sentinel Hub layers, there are four ways to determine their content:

- by `instanceId` and `layerId`: ID of the layer, as used by OGC WMS and SentinelHub Configurator
- by `evalscript`: custom (javascript) code that will be executed by the service per each pixel and will calculate the (usually RGB/RGBA) values
- by `evalscriptUrl`: the URL from which the evalscript can be downloaded from
- by `dataProduct`: the ID of a pre-existing data product

```javascript
  import { S1GRDAWSEULayer } from '@sentinel-hub/sentinelhub-js';

  let layerS1;
  layerS1 = new S1GRDAWSEULayer({
    instanceId: '<my-instance-id>',
    layerId: '<layer-id>',
  );
  layerS1 = new S1GRDAWSEULayer({
    evalscript: myEvalscript,
    title: 'Title',
    description: 'Description',
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });
  layerS1 = new S1GRDAWSEULayer({
    evalscriptUrl: myEvalscriptUrl,
    acquisitionMode: AcquisitionMode.IW,
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
  });
  layerS1 = new S1GRDAWSEULayer({
    dataProduct: '<data-product-id>',
    acquisitionMode: AcquisitionMode.EW,
    polarization: Polarization.DH,
    resolution: Resolution.MEDIUM,
  });
```

It is also possible to create layers by importing their definitions from the Sentinel Hub configuration instance:

```javascript
  import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

  const layers = await LayersFactory.makeLayers('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>');
    // [ layer1, layer2, ... ] - a list of Layer objects

  const layersIds = layers.map(l => l.layerId);
    // [ '<layer-id-1>', '<layer-id-2>',... ]
```

Depending on the first parameter (`baseUrl`), method `makeLayers()` tries to determine if a specific `Layer` subclass would be better suited and instantiates it with all applicable parameters.

The list can be filtered to include only some of the layers:
```javascript
  import { LayersFactory, DATASET_S2L2A } from '@sentinel-hub/sentinelhub-js';

  // this will return only a list of those S2L2A layers whose IDs start with "ABC_":
  const layers = await LayersFactory.makeLayers(
    'https://services.sentinel-hub.com/ogc/wms/<your-instance-id>',
    (layerId, dataset) => layerId.startsWith("ABC_") && dataset === DATASET_S2L2A,
  );
```

Alternatively, we can also fetch a single layer by using `makeLayer` method:
```javascript
  import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

  const layer = await LayersFactory.makeLayer('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>', '<layer-id>');
```

Some additional layer information can be passed to `makeLayer` and `makeLayers` as an object in order to create layers with the provided information instead of the information from the services.

```javascript
  const layer = await LayersFactory.makeLayer('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>', '<layer-id>', { maxCloudCoverPercent: 30 });

  const layers = await LayersFactory.makeLayers('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>', null, { maxCloudCoverPercent: 30 });
  ```

Some information about the layer is only accessible to authenticated users. The process of getting the authentication token and authenticating is described in [Authentication for Processing API](#authentication-for-processing-api).

## Fetching images

Maps which correspond to these layers can be fetched via different protocols like WMS and Processing. Not all of the protocols can be used in all cases; for example, Processing can only render layers for which it has `evalscript` available and for which evalscript version 3 is used.

```javascript
  import { BBox, CRS_EPSG4326, MimeTypes, ApiType } from '@sentinel-hub/sentinelhub-js';

  const bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22);
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
  };

  const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
  const imageBlob2 = await layer.getMap(getMapParams, ApiType.PROCESSING);
```

Note that both of the images above should be _exactly_ the same.

In some cases we can retrieve just the image URL instead of a blob:

```javascript
  const imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);
  const imageUrl2 = layer.getMapUrl(getMapParams, ApiType.PROCESSING); // exception thrown - Processing API does not support HTTP GET method
```

It is also possible to determine whether a layer supports a specific ApiType:
```javascript
  if (layer.supportsApiType(ApiType.PROCESSING)) {
    imageUrl = layer.getMapUrl(getMapParams, ApiType.PROCESSING);
  } else {
    imageUrl = layer.getMapUrl(getMapParams, ApiType.WMS);
  };
```

If your evalscript contains multiple [output response objects](https://docs.sentinel-hub.com/api/latest/evalscript/v3/#output-object-properties), you can set the `outputResponseId` to set which output should be returned.

**Note:** This feature is only available with Processing API.

```javascript
  const getMapParams = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
    outputResponseId: 'default',
  };

  const imageBlob = await layer.getMap(getMapParams, ApiType.PROCESSING);
```

### Optimizing the data retrieval

This library is often used to display satellite imagery on the map. Data in this case is requested in "tiles" (typically of 256x256 or 512x512 pixels) and is often overlaid over some background map, which shows land cover, borders, roads, places,... Thus, when making `getMap` requests, it is usually desirable to get images which are transparent in places where the satellite data is not available. The easiest solution is to use `PNG` format instead of `JPEG` (because `JPEG` does not support transparency), however this makes the size of the images much bigger, leading to longer load times on slow connections.

To solve this issue, there is a special format available (`MimeTypes.JPEG_OR_PNG`). If specified, `getMap` call will try to determine if it should use `JPEG` or `PNG` based on the data available. If requested bounding box is fully covered with data, it will use JPEG (for performance reasons), otherwise it will use PNG and will return an image with transparent channel.

CAREFUL: this setting should only be used if the retrieved data is not transparent (within the tiles). In other words: if `evalscript` returns a transparent image channel, using `PNG` is probably the only viable option.

```javascript
  const getMapParams = {
    bbox: new BBox(CRS_EPSG4326, 18.3, 20.1, 18.7, 20.4),
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG_OR_PNG,
  };
  const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
  const imageBlob2 = await layer.getMap(getMapParams, ApiType.PROCESSING);
```

### Effects

When requesting an image, effects can be applied to visually improve the image.
To apply the effects, the `effects` param in `getMapParams` should be present, containing the desired effects.
Supported effects are `gain`, `gamma`, `redRange`, `greenRange`, `blueRange` and `customEffect`.

Effects `gain` and `gamma` accept values equal or greater than 0.

Effects `redRange`, `greenRange` and `blueRange` accept the values between 0 and 1, including both 0 and 1.
Setting values to `redRange`, `greenRange` and `blueRange` limits the values that pixels can have for red, green and blue color component respectively.

Effect `customEffect` is a function that receives red, green and blue values and returns new red, green and blue values.
It operates with values between 0 and 1, including both 0 and 1.

```javascript
  const getMapParamsWithEffects = {
    bbox: bbox,
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    width: 512,
    height: 512,
    format: MimeTypes.JPEG,
    effects: {
      gain: 1.2,
      gamma: 0.9,
      redRange: {from: 0.2, to: 0.8},
      greenRange: {from: 0.2, to: 0.8},
      blueRange: {from: 0.2, to: 0.8},
      customEffect: ({r,g,b,a}) => ({r,g,b,a})
      }
    }
  };

  const imageBlob = await layer.getMap(getMapParamsWithEffects, ApiType.WMS);
  const imageBlob2 = await layer.getMap(getMapParamsWithEffects, ApiType.PROCESSING);
```

**Note:** Effects are applied by the library (client-side) and are thus only available when the blob is retrieved (`getMap`) and not through the URL (`getMapUrl`).
When retrieving an image URL (via `getMapUrl()`) with effects in the parameters, an error is thrown, because the retrieved URL points directly to the image on the services with no applied effects.

### Stitching images

Services limit the size of the output image per request (2500px in each direction). If we need a bigger image, we can issue multiple requests and stitch the results together in a canvas. A utility method `getHugeMap` allows us to do that seamlessly.

IMPORTANT: be careful with the image sizes as a big image could consume a lot of processing units. There is no limit imposed by this method.

```javascript
  const imageBlob = await layer.getHugeMap(getMapParams, ApiType.PROCESSING, requestsConfig);
```

## Searching for data

Searching for the data is a domain either of a _layer_ or its _dataset_ (if available). This library supports different services, some of which (ProbaV and GIBS for example) specify availability dates _per layer_ and not dataset.

We can always use layer to search for data availability:
```typescript
  import { OrbitDirection } from '@sentinel-hub/sentinelhub-js';

  const layerS2L2A = new S2L2ALayer({
    instanceId: '<my-instance-id>',
    layerId: '<layer-id-S2L2A>',
    maxCloudCoverPercent: 50,
  });
  const { tiles, hasMore } = await layerS2L2A.findTiles(bbox, fromTime, toTime, maxCount, offset);
  const flyoversS2L2A = await layerS2L2A.findFlyovers(bbox, fromTime, toTime);
  const datesS2L2A = await layerS2L2A.findDatesUTC(bbox, fromTime, toTime);

  const layerS1 = new S1GRDAWSEULayer({
    instanceId: '<my-instance-id>',
    layerId: '<layer-id-S1GRD>',
    orthorectify: true,
    backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
    orbitDirection: OrbitDirection.ASCENDING,
  });
  const { tiles: tilesS1 } = await layerS1.findTiles(bbox, fromTime, toTime, maxCount, offset);
  const flyoversS1 = await layerS1.findFlyovers(bbox, fromTime, toTime);
  const datesS1 = await layerS1.findDatesUTC(bbox, fromTime, toTime);
```


## Requests configuration

You can specify that network requests should be retried by passing the max. number of retries for each of the network requests used by the method. If not specified or set to `null`, the default value for `retries` is used (`2` - which means 3 attempts altogether). To disable retrying, set it to `0`.

```typescript
const requestsConfig = {
  retries: 1, // max. 2 attempts for each of the network requests within the called method
};
```

You can specify a timeout in milliseconds for network requests. This will cancel all the network requests triggered by the method after the specified time frame. Default value for `timeout` is `null` (disabled).

Specifying the timeout will limit the time spent in the method, by cancelling the network requests (including retries) that take too long.

```typescript
import { isCancelled } from '@sentinel-hub/sentinelhub-js';

const requestsConfig = {
  timeout: 5000,
};

try {
  const img = await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
  const dates = await layer.findDatesUTC(bbox, fromTime, toTime, requestsConfig);
  const stats = await layer.getStats(getStatsParams, requestsConfig);
  const tiles = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
} catch (err) {
  // The exception thrown by canceling network requests can be caught and identified by `isCancelled`.
  if (!isCancelled(err)) {
    throw err;
  }
}
```

You can also cancel requests explicitly when searching/fetching data. To do so a token needs to be created and passed through the requests configuration object.

In the example below, a cancel token is passed inside the configuration request object. The timeout will cancel the requests after 500 miliseconds, throwing an exception.

```typescript
import { CancelToken, isCancelled } from '@sentinel-hub/sentinelhub-js';

const token = new CancelToken();

const requestsConfig = {
  cancelToken: token,
  retries: 4,
};

const requestTimeout = setTimeout(() => {
  token.cancel();
}, 500);

try {
  const img = await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
  const dates = await layer.findDatesUTC(bbox, fromTime, toTime, requestsConfig);
  const stats = await layer.getStats(getStatsParams, requestsConfig);
  const tiles = await layer.findTiles(bbox, fromTime, toTime, null, null, requestsConfig);
  clearTimeout(requestTimeout);
} catch (err) {
  // The exception thrown by canceling network requests can be caught and identified by `isCancelled`.
  if (!isCancelled(err)) {
    throw err;
  }
}
```

Caching is enabled by default where items expire in 30 minutes. Expired items are deleted every minute.  
To modify the caching, one can add `expiresIn` to the requests configuration object. The values are in seconds. Value `0` disables caching.
```javascript
// cache is valid for 30 minutes:
const requestsConfig = {
  cache: {
    expiresIn: 1800,
  }
};
```

Responses can be cached to [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache):
```javascript
  const requestsConfig = {
    cache: {
      expiresIn: 5000,
      targets: [CacheTarget.CACHE_API],
    },
  };
```

They can also be cached to memory:
```javascript
  const requestsConfig = {
    cache: {
      expiresIn: 5000,
      targets: [CacheTarget.MEMORY],
    },
  };
```

A list of targets can be provided which is ordered by priority, and the first available target in the list will be used. This example will fallback to caching to memory if [CACHE_API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) is not available:

```javascript
  const requestsConfig = {
    cache: {
      expiresIn: 5000,
      targets: [CacheTarget.CACHE_API, CacheTarget.MEMORY],
    },
  };
```

If a default requests configuration object is specified, it will be used for any key which is not set explicitly:

```javascript
  setDefaultRequestsConfig({
    retries: 2,
  });
```

## Getting basic statistics and histogram

Getting basic statistics (mean, min, max, standard deviation) and a histogram for a geometry (Polygon or MultiPolygon).
The histogram uses the `equalfrequency` binning method and defaults to 5 bins.

```javascript
  const stats = await layer.getStats({
    geometry: bbox.toGeoJSON(),
    fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
    resolution: resolution,
    bins: 10,
  });
```


## Backwards compatibility

To make it easier to use this library with legacy code, there are two functions that are implemented on top of the library, which do not require instantiating a `Layer` subclass.

```javascript
  const imageBlob1 = await legacyGetMapFromParams(rootUrl, wmsParams);
  const imageBlob2 = await legacyGetMapFromParams(rootUrl, wmsParams, ApiType.PROCESSING); // ApiType.WMS is default
```

If we already have a WMS GetMap URL, we can use it directly:

```javascript
  const imageBlob3 = await legacyGetMapFromUrl(fullUrlWithWmsQueryString);
  const imageBlob4 = await legacyGetMapFromUrl(fullUrlWithWmsQueryString, ApiType.PROCESSING);
```

`legacyGetMapFromParams` and `legacyGetMapFromUrl` accept all parameters that are supported in [OGC WMS GetMap standard](https://www.sentinel-hub.com/develop/api/ogc/standard-parameters/wms/) and [Sentinel hub OGC API](https://www.sentinel-hub.com/develop/api/ogc/custom-parameters/), either as a property inside `wmsParams` object or as a substring of the `fullUrlWithWmsQueryString`.
Example params: `gain`, `gamma`, `upsampling`, `downsampling`, etc.

`legacyGetMapFromParams` and `legacyGetMapFromUrl` also accept the parameters that are used for creating a dataset-specific layer object or for getting the data with `getMap()` function but are not supported in [OGC WMS GetMap standard](https://www.sentinel-hub.com/develop/api/ogc/standard-parameters/wms/) and [Sentinel hub OGC API](https://www.sentinel-hub.com/develop/api/ogc/custom-parameters/).
- Parameters which would be used for creating a `Layer` can be passed inside of `overrideLayerConstructorParams`.
Example params: dataset-specific params for creating [layers](#layers)
- Parameters which would be passed to `getMap` can be passed inside the `overrideGetMapParams`.
Example params: [effects](#effects)

```javascript
  const imageBlob5 = await legacyGetMapFromParams(
    rootUrl,
    wmsParams,
    ApiType.PROCESSING
    fallbackToWmsApi,
    overrideLayerConstructorParams,
    overrideGetMapParams,
  );
```

## Authentication for Processing API

Requests to Processing API need to be authenticated.
Documentation about authentication is available at [Sentinel Hub documentation](https://docs.sentinel-hub.com/api/latest/#/API/authentication).

In short, authentication is done by getting an authentication token using OAuth Client's id and secret, and setting it.

To get the OAuth Client's id and secret, a new OAuth Client must be created in [**User settings**](https://apps.sentinel-hub.com/dashboard/#/account/settings) on **Sentinel Hub Dashboard** under **OAuth clients**.
OAuth Client's secret is shown only before the creation process is finished so be mindful to save it.

Getting the authentication token by calling `requestAuthToken()` with the OAuth Client's id and secret as its parameters and then setting the authentication token:

```javascript
  import { setAuthToken, requestAuthToken } from '@sentinel-hub/sentinelhub-js';

  const clientId = /* OAuth Client's id, best to put it in .env file and use it from there */;
  const clientSecret = /* OAuth client's secret, best to put it in .env file and use it from there */;
  const authToken = await requestAuthToken(clientId, clientSecret);

  const before = isAuthTokenSet(); // false
  setAuthToken(authToken);
  const after = isAuthTokenSet(); // true
```

Alternatively, authentication token can be set on a per-request basis, which also overrides any global token that was set by `setAuthToken`:

```javascript
  const requestsConfig = {
    authToken: authToken,
  };
  const img = await layer.getMap(getMapParams, ApiType.PROCESSING, requestsConfig);
```

## Utility functions

### Async conversion between Blob and Canvas

Function `drawBlobOnCanvas` allows drawing a `Blob` on existing canvas element:

```javascript
  const blob = await layer.getMap(params, ApiType.WMS);

  const canvas = document.createElement('canvas');
  canvas.width = params.width;
  canvas.height = params.height;
  const ctx = canvas.getContext('2d');

  await drawBlobOnCanvas(ctx, blob, 0, 0);
```

Function `canvasToBlob` converts the provided canvas to `Blob`:

```javascript
  const blob = await canvasToBlob(canvas);
```

## Debugging

This library is an abstraction layer that provides nice interface for accessing the underlying services, which simplifies development - but when requests fail, it is sometimes difficult to understand why. To enable easier debugging, `setDebugEnabled` can be used:

```javascript
  import { setDebugEnabled } from '@sentinel-hub/sentinelhub-js';

  setDebugEnabled(true);
  // ... failing operation
  setDebugEnabled(false);
```

While debug mode is enabled, library will output any request it makes (even if the response comes from cache) to console in the form of a `curl` command.

# Examples
This project contains some examples to demonstrate how the library is used.
Some preparation is needed before running the examples.

## Preparation before running examples
To run the examples, the environment variables must be set.
These variables should be put in the `.env` file in the root folder of this project.

- `CLIENT_ID`: OAuth Client's id (optional, authentication is needed for examples that use Processing API)
- `CLIENT_SECRET`: OAuth Client's secret (optional, authentication is needed for examples that use Processing API)

- `INSTANCE_ID`: id of the configuration instance that will be used in examples
- `S1GRDIW_LAYER_ID`: id of the Sentinel-1 GRD IW layer from that instance
- `S1GRDEW_LAYER_ID`: id of the Sentinel-1 GRD EW layer from that instance
- `S2L2A_LAYER_ID`: id of the Sentinel-2 L2A layer from that instance
- ... (see `.env.example` for full list)

Instance can be created with the [**Configurator**](https://apps.sentinel-hub.com/dashboard/#/configurations) on the **Sentinel Hub Dashboard**. It should contain the layers in the list above for examples to work.

`CLIENT_ID` and `CLIENT_SECRET` are needed so that the authentication token can be requested, which is then used in examples that use Processing API.
The process of getting those two is described in [Authentication for Processing API](#authentication-for-processing-api)

## Running examples

### Node.js

```bash
$ npm install
$ npm run build
$ cd example/node
$ node index.js
```

### Storybook

```bash
$ npm install
$ npm run build
$ cp .env.example .env
  (... edit .env ...)
$ npm run storybook
```

# Copyright and license

Copyright (c) 2020 Sinergise Ltd. Code released under the [MIT License](https://github.com/sentinel-hub/sentinelhub-js/blob/master/LICENSE.md).
