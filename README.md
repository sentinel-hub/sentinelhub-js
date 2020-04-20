
- [Installation](#installation)
- [Usage](#usage)
  - [Layers](#layers)
  - [Fetching images](#fetching-images)
  - [Searching for data](#searching-for-data)
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

  const layers = LayersFactory.makeLayers('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>');
    // [ layer1, layer2, ... ] - a list of Layer objects

  const layersIds = layers.map(l => l.layerId);
    // [ '<layer-id-1>', '<layer-id-2>',... ]
```

Depending on `baseUrl`, method `makeLayers()` tries to determine if a specific `Layer` subclass would be better suited and instantiates it with all applicable parameters.

Alternatively, the list can be filtered to include only some of the layers:
```javascript
  import { LayersFactory, DATASET_S2L2A } from '@sentinel-hub/sentinelhub-js';

  // this will return only a list of those S2L2A layers whose IDs start with "ABC_":
  const layers = LayersFactory.makeLayers(
    'https://services.sentinel-hub.com/ogc/wms/<your-instance-id>',
    (layerId, dataset) => layerId.startsWith("ABC_") && dataset === DATASET_S2L2A,
  );
```

Some information about the layer is only accessible to authenticated users. In case of Playground and EO Browser, ReCaptcha auth token is sufficient to fetch layer information (such as evalscript / dataProduct). To avoid updating every layer when auth token changes, we have a global function for updating it:

```javascript
  import { isAuthTokenSet, setAuthToken } from '@sentinel-hub/sentinelhub-js';

  const before = isAuthTokenSet(); // false
  setAuthToken(newAuthToken);
  const after = isAuthTokenSet(); // true
```

The process of getting the authentication token is described in [Authentication for Processing API](#authentication-for-processing-api).

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
  const imageUrl = await layer.getMapUrl(getMapParams, ApiType.WMS);
  const imageUrl2 = await layer.getMapUrl(getMapParams, ApiType.PROCESSING); // exception thrown - Processing API does not support HTTP GET method
```

It is also possible to determine whether a layer supports a specific ApiType:
```javascript
  if (layer.supportsApiType(ApiType.PROCESSING)) {
    imageUrl = await layer.getMapUrl(getMapParams, ApiType.PROCESSING);
  } else {
    imageUrl = await layer.getMapUrl(getMapParams, ApiType.WMS);
  };
```

## Searching for data

Searching for the data is a domain either of a _layer_ or its _dataset_ (if available). This library supports different services, some of which (ProbaV and GIBS for example) specify availability dates _per layer_ and not dataset.

We can always use layer to search for data availability:
```typescript
  import { OrbitDirection } from '@sentinel-hub/sentinelhub-js';

  const layerS2L2A = new S2L2ALayer({
    instanceId: '<my-instance-id>',
    layerId: 'LAYER_S2L2A',
    maxCloudCoverPercent: 50,
  });
  const { tiles, hasMore } = await layerS2L2A.findTiles(bbox, fromTime, toTime, maxCount, offset);
  const flyoversS2L2A = await layerS2L2A.findFlyovers(bbox, fromTime, toTime);
  const datesS2L2A = await layerS2L2A.findDatesUTC(bbox, fromTime, toTime);

  const layerS1 = new S1GRDAWSEULayer({
    instanceId: '<my-instance-id>',
    layerId: 'LAYER_S1GRD',
    orthorectify: true,
    backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
    orbitDirection: OrbitDirection.ASCENDING,
  });
  const { tiles: tilesS1 } = await layerS1.findTiles(bbox, fromTime, toTime, maxCount, offset);
  const flyoversS1 = await layerS1.findFlyovers(bbox, fromTime, toTime);
  const datesS1 = await layerS1.findDatesUTC(bbox, fromTime, toTime);
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
setAuthToken(authToken);
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
