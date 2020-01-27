
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
- [Running examples](#running-examples)
  - [Node.js](#node-js)
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

## Fetching images

Maps which correspond to these layers can be fetched via different protocols like WMS and Processing. Not all of the protocols can be used in all cases; for example, Processing can only render layers for which it has access to the `evalscript` and for which evalscript version 3 is used.

```javascript
  import { BBox, CRS_EPSG4326, MimeTypes, ApiType } from 'sentinelhub-js';

  const bbox = new BBox(CRS_EPSG4326, 18, 20, 20, 22);
  const getMapParams = {
    bbox: bbox,
    from: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
    to: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
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
  const flyovers = layerS2L2A.findFlyovers(bbox, fromDate, toDate, cloudCoverage);
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

# Running examples

Most of the example can be run as-is, however for some of them (those using Processing API) authentication token should be set. See [Sentinel Hub documentation](https://docs.sentinel-hub.com/api/latest/#/API/authentication) for details.

## Node.js

```bash
$ npm install
$ npm run build
$ cd example/node
$ node index.js
```

## Storybook

```bash
$ npm install
$ npm run build
$ cp .env.example .env
  (... edit .env ...)
$ npm run storybook
```

# Copyright and license

Copyright (c) 2020 Sinergise Ltd. Code released under the [MIT License](https://github.com/sentinel-hub/sentinelhub-js/blob/master/LICENSE.md).
