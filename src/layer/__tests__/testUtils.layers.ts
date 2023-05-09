import MockAdapter from 'axios-mock-adapter';
import { AbstractSentinelHubV3Layer } from '../AbstractSentinelHubV3Layer';

export const checkLayersParamsEndpoint = async (
  mockNetwork: MockAdapter,
  layerClass: typeof AbstractSentinelHubV3Layer,
  expectedEndpoint: string,
): Promise<void> => {
  const instanceId = 'INSTANCE_ID';
  const layerId = 'LAYER_ID';

  mockNetwork.onGet().reply(200, [
    {
      id: layerId,
      styles: [
        {
          evalScript: '//',
        },
      ],
    },
  ]);

  const layer = new layerClass({
    instanceId,
    layerId,
  });
  await layer.updateLayerFromServiceIfNeeded({});
  expect(mockNetwork.history.get[0].url).toBe(
    `${expectedEndpoint}/configuration/v1/wms/instances/${instanceId}/layers`,
  );
};
