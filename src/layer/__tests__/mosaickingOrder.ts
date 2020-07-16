import 'jest-setup';
import { ApiType, MosaickingOrder, S2L2ALayer, setAuthToken } from '../../../src';
import { ProcessingPayload, ProcessingPayloadDatasource } from '../processing';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { constructFixtureMosaickingOrder } from './fixtures.mosaickingOrder';

const extractDataFilterFromPayload = (payload: ProcessingPayload): any => {
  const data: ProcessingPayloadDatasource[] = payload.input.data;
  const processingPayloadDatasource: ProcessingPayloadDatasource = data.find(ppd => ppd.dataFilter);
  return processingPayloadDatasource.dataFilter;
};

test('Mosaicking order is not set in constructor', async () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
  });

  expect(layerS2L2A.mosaickingOrder).toBeNull();
});

test('Mosaicking order is set in constructor', async () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    mosaickingOrder: MosaickingOrder.LEAST_CC,
  });

  expect(layerS2L2A.mosaickingOrder).toBe(MosaickingOrder.LEAST_CC);
});

test('Mosaicking order can be changed', async () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    mosaickingOrder: MosaickingOrder.LEAST_CC,
  });
  expect(layerS2L2A.mosaickingOrder).toBe(MosaickingOrder.LEAST_CC);
  layerS2L2A.mosaickingOrder = MosaickingOrder.MOST_RECENT;
  expect(layerS2L2A.mosaickingOrder).toBe(MosaickingOrder.MOST_RECENT);
});

test('Mosaicking order is set on instance/layer in dashboard WMS', async () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
  });

  const { getMapParams } = constructFixtureMosaickingOrder();

  const mockNetwork = new MockAdapter(axios);
  mockNetwork.reset();
  mockNetwork.onGet().reply(200);

  expect(layerS2L2A.mosaickingOrder).toBeNull();
  await layerS2L2A.getMap(getMapParams, ApiType.WMS);
  expect(mockNetwork.history.get.length).toBe(1);
  expect(mockNetwork.history.get[0].url).not.toHaveQueryParams(['priority']);

  layerS2L2A.mosaickingOrder = MosaickingOrder.LEAST_RECENT;
  await layerS2L2A.getMap(getMapParams, ApiType.WMS);
  expect(mockNetwork.history.get.length).toBe(2);
  const { url } = mockNetwork.history.get[1];
  expect(url).toHaveQueryParams(['priority']);
  expect(url).toHaveQueryParamsValues({ priority: MosaickingOrder.LEAST_RECENT });
});

test('Mosaicking order is set from instance/layer in dashboard processing', async () => {
  const layerS2L2A = new S2L2ALayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
  });

  const { getMapParams, mockedLayersResponse } = constructFixtureMosaickingOrder();

  const mockNetwork = new MockAdapter(axios);
  mockNetwork.reset();
  mockNetwork.onGet().reply(200, mockedLayersResponse);
  mockNetwork.onPost().reply(200);
  setAuthToken('Token');
  expect(layerS2L2A.mosaickingOrder).toBeNull();
  await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
  expect(mockNetwork.history.post.length).toBe(1);
  let dataFilter = extractDataFilterFromPayload(JSON.parse(mockNetwork.history.post[0].data));
  expect(dataFilter.mosaickingOrder).toBe(MosaickingOrder.MOST_RECENT);
  expect(layerS2L2A.mosaickingOrder).toBe(MosaickingOrder.MOST_RECENT);

  dataFilter = null;
  layerS2L2A.mosaickingOrder = MosaickingOrder.LEAST_RECENT;
  await layerS2L2A.getMap(getMapParams, ApiType.PROCESSING);
  dataFilter = extractDataFilterFromPayload(JSON.parse(mockNetwork.history.post[1].data));
  expect(mockNetwork.history.post.length).toBe(2);
  expect(dataFilter.mosaickingOrder).toBe(MosaickingOrder.LEAST_RECENT);
  expect(layerS2L2A.mosaickingOrder).toBe(MosaickingOrder.LEAST_RECENT);
});
