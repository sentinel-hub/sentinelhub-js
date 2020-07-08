import 'jest-setup';

import { AbstractSentinelHubV3Layer } from '../AbstractSentinelHubV3Layer';

import { ApiType } from 'src';

test.each([
  [{ '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L1C/dataproducts/99999' }, false],
  [{ '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L1C/dataproducts/644' }, true],
])(
  'AbstractSentinelHubV3Layer.supportsApiType correctly handles DataProducts supported by Processing API',
  (dataProduct, expectedResult) => {
    const layer = new AbstractSentinelHubV3Layer({
      dataProduct: dataProduct,
    });
    expect(layer.supportsApiType(ApiType.PROCESSING)).toBe(expectedResult);
  },
);
