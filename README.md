
-----

>
> Warning!!!
>
> The interface of the library is not final yet - expect breaking changes.
>

-----

- [Installation](#installation)
- [Usage](#usage)
  - [Layers](#layers)
  - [Fetching images](#fetching-images)
  - [Searching for data](#searching-for-data)
  - [Backwards compatibility](#backwards-compatibility)
- [Authentication for Processing API](#authentication-for-processing-api)
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

The core data structure is `Layer`, which corresponds to a _layer_ as returned by OGC WMS GetCapabilities request. If the URL matches one of the Sentinel Hub service URLs, additional capabilities are unlocked.

Basic (WMS-capable) `Layer` can be initialized like this:

```javascript
  import { WmsLayer } from 'sentinelhub-js';

  const layer = new WmsLayer('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>', '<layer-id>', 'Title', 'Description');
```

Such layer would only allow WMS requests. However, `Layer` is also a superclass for multiple dataset-specific subclasses (like `S1GRDIWAWSLayer`) which can be instantiated with their own specific parameters and thus unlock additional powers.

When it comes to Sentinel Hub layers, there are four ways to determine their content:

- by `layerId`: ID of the layer, as used by OGC WMS and SentinelHub Configurator
- by `evalscript`: custom (javascript) code that will be executed by the service per each pixel and will calculate the (usually RGB/RGBA) values
- by `evalscriptUrl`: the URL from which the evalscript can be downloaded from
- by `dataProduct`: the structure which contains an ID of a pre-existing product

```javascript
  import { S1GRDIWAWSLayer } from 'sentinelhub-js';

  layerS1 = new S1GRDIWAWSLayer(instanceId, '<layer-id>', null, null, null, 'Title', 'Description');
  layerS1 = new S1GRDIWAWSLayer(instanceId, null, myEvalscript);
  layerS1 = new S1GRDIWAWSLayer(instanceId, null, null, myEvalscriptUrl);
  layerS1 = new S1GRDIWAWSLayer(instanceId, null, null, null, '<data-product-id>');
  layerS1 = new S1GRDIWAWSLayer(instanceId, '<layer-id>', null, null, null, 'Title', 'Description', orthorectified=true);
```

It is also possible to get the list of the layers that service endpoint supports:

```javascript
  import { LayersFactory } from 'sentinelhub-js';

  const layers = LayersFactory.makeLayers('https://services.sentinel-hub.com/ogc/wms/<your-instance-id>');
    // [ layer1, layer2, ... ] - a list of Layer objects

  const layersIds = layers.map(l => l.layerId);
    // [ '<layer-id-1>', '<layer-id-2>',... ]
```

Depending on `baseUrl`, method `makeLayers()` tries to determine if a specific `Layer` subclass would be better suited and instantiates it with all applicable parameters.

Alternatively, the list can be filtered to include only some of the layers:
```javascript
  import { LayersFactory, DATASET_S2L2A } from 'sentinelhub-js';

  // this will return only a list of those S2L2A layers whose IDs start with "ABC_":
  const layers = LayersFactory.makeLayers(
    'https://services.sentinel-hub.com/ogc/wms/<your-instance-id>',
    (layerId, dataset) => layerId.startsWith("ABC_") && dataset === DATASET_S2L2A,
  );
```

Some information about the layer is only accessible to authenticated users. In case of Playground and EO Browser, ReCaptcha auth token is sufficient to fetch layer information (such as evalscript / dataProduct). To avoid updating every layer when auth token changes, we have a global function for updating it:

```javascript
  import { isAuthTokenSet, setAuthToken } from 'sentinelhub-js';

  const before = isAuthTokenSet(); // false
  setAuthToken(newAuthToken);
  const after = isAuthTokenSet(); // true
```

The process of getting the authentication token is described in [Authentication for Processing API](#authentication-for-processing-api).

## Fetching images

Maps which correspond to these layers can be fetched via different protocols like WMS and Processing. Not all of the protocols can be used in all cases; for example, Processing can only render layers for which it has access to the `evalscript` and for which evalscript version 3 is used.

```javascript
  import { BBox, CRS_EPSG4326, MimeTypes, ApiType } from 'sentinelhub-js';

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

Note that in theory both images should be _exactly_ the same. If there are any (minor) differences, they are a consequence of how service processes requests, not because of different interpretation of getMapParams on the side of this library.

In some cases we can retrieve just the image URL instead of a blob:

```javascript
  const imageUrl = await layer.getMapUrl(getMapParams, ApiType.WMS);
  const imageUrl2 = await layer.getMapUrl(getMapParams, ApiType.PROCESSING); // exception thrown - Processing API does not support HTTP GET method
```

## Searching for data

Searching for the data is a domain either of a _layer_ or its _dataset_ (if available). This library supports different services, some of which (ProbaV and GIBS for example) specify availability dates _per layer_ and not dataset.

We can always use layer to search for data availability:
```typescript
  import { OrbitDirection } from 'sentinelhub-js';

  const layerS2L2A = new S2L2ALayer(instanceId, 'S2L2A');
  const cloudCoveragePercent = 50;
  const tilesS2 = layerS2L2A.findTiles(bbox, fromDate, toDate, maxCount, offset, cloudCoverage);

  const layerS1 = new S1GRDIWAWSLayer(instanceId, 'LayerS1GRD');
  const orbitDirection = OrbitDirection.ASCENDING;
  const tilesS1 = layerS1.findTiles(bbox, fromDate, toDate, maxCount, offset, orbitDirection);

  const dates = layerS2L2A.findDatesUTC(bbox, fromDate, toDate, cloudCoverage);

  const flyovers = layerS2L2A.groupTilesByFlyovers(tilesS2.tiles);
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

# Authentication for Processing API

Requests to Processing API need to be authenticated.
Documentation about authentication is available at [Sentinel Hub documentation](https://docs.sentinel-hub.com/api/latest/#/API/authentication).

In short, authentication is done by getting an authentication token using OAuth Client's id and secret, and setting it.

To get the OAuth Client's id and secret, a new OAuth Client must be created in [**User settings**](https://apps.sentinel-hub.com/dashboard/#/account/settings) on **Sentinel Hub Dashboard** under **OAuth clients**.
OAuth Client's secret is shown only before the creation process is finished so be mindful to save it.

Getting the authentication token by calling `requestAuthToken()` with the OAuth Client's id and secret as its parameters and then setting the authentication token:

```javascript
const { setAuthToken, requestAuthToken } = require('sentinelhub-js');

const clientId = /* OAuth Client's id, best to put it in .env file and use it from there */;
const clientSecret = /* OAuth client's secret, best to put it in .env file and use it from there */;
const authToken = await requestAuthToken(clientId, clientSecret);
setAuthToken(authToken);
```

# Examples
This project contains some examples to demonstrate how the library is used.
Some preparation is needed before running the examples.

## Preparation before running examples
To run the examples, the environment variables must be set.
These variables should be put in the `.env` file in the root folder of this project.

- `CLIENT_ID`: OAuth Client's id (optional, authentication is needed for examples that use Processing API)
- `CLIENT_SECRET`: OAuth Client's secret (optional, authentication is needed for examples that use Processing API)

- `INSTANCE_ID`: id of the configuration instance that will be used in examples
- `S2L2A_LAYER_ID`: id of the Sentinel-2 L2A layer from that instance
- `S1GRD_LAYER_ID`: id of the Sentinel-1 GRD layer from that instance

Instance can be created with the [**Configurator**](https://apps.sentinel-hub.com/dashboard/#/configurations) on the **Sentinel Hub Dashboard**.
It should contain at least one Sentinel-2 L2A layer and one Sentinel-1 GRD layer, whose layer IDs should be the same as set in `S2L2A_LAYER_ID` and `S1GRD_LAYER_ID` env vars respectively.

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
