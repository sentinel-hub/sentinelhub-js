import { DEMCDASLayer, DEMInstanceType, setAuthToken } from '../../index';

import { AUTH_TOKEN, mockNetwork } from './testUtils.findTiles';

import { checkLayersParamsEndpoint } from './testUtils.layers';

describe('correct endpoint is used for layer params', () => {
  beforeEach(async () => {
    setAuthToken(AUTH_TOKEN);
    mockNetwork.reset();
  });

  test('updateLayerFromServiceIfNeeded', async () => {
    await checkLayersParamsEndpoint(mockNetwork, DEMCDASLayer, 'https://sh.dataspace.copernicus.eu');
  });
});

describe('check supported DEM instances', () => {
  test.each([
    [
      {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
      },
      undefined,
      false,
    ],
    [
      {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        demInstance: DEMInstanceType.COPERNICUS_30,
      },
      DEMInstanceType.COPERNICUS_30,
      false,
    ],
    [
      {
        instanceId: 'INSTANCE_ID',
        layerId: 'LAYER_ID',
        demInstance: DEMInstanceType.MAPZEN,
      },
      undefined,
      true,
    ],
  ])('check supported DEM instances', (params, expectedResult, shouldThrowError) => {
    if (shouldThrowError) {
      expect(() => new DEMCDASLayer(params)).toThrowError();
    } else {
      const layer: DEMCDASLayer = new DEMCDASLayer(params);
      expect(layer.getDemInstance()).toBe(expectedResult);
    }
  });
});
