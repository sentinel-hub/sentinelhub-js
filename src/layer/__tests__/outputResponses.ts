import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  ApiType,
  setAuthToken,
  invalidateCaches,
  S2L2ALayer,
  BBox,
  CRS_EPSG4326,
  MimeTypes,
} from '../../index';
import '../../../jest-setup';

const mockNetwork = new MockAdapter(axios);
const EXAMPLE_TOKEN = 'TOKEN111';

const layerWMS = new S2L2ALayer({ instanceId: 'INSTANCE_ID', layerId: 'LAYER_ID' });
const layerProcessing = new S2L2ALayer({
  evalscript: `//VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: [{ id: "default", bands: 4 }, { id: "index", bands: 2 }]
        };
      }

      function evaluatePixel(sample) {
        return {
            default: [4 * sample.B04, 4 * sample.B03, 4 * sample.B02, sample.dataMask],
            index: [sample.B04, sample.dataMask] 
          };
      }`,
  maxCloudCoverPercent: 100,
});

const getMapParams = {
  bbox: new BBox(CRS_EPSG4326, 18, 20, 20, 22),
  fromTime: new Date(Date.UTC(2019, 11 - 1, 22, 0, 0, 0)),
  toTime: new Date(Date.UTC(2019, 12 - 1, 22, 23, 59, 59)),
  width: 512,
  height: 512,
  format: MimeTypes.JPEG,
};
const getMapParamsDefaultResponseId = { ...getMapParams, outputResponseId: 'default' };
const getMapParamsIndexResponseId = { ...getMapParams, format: MimeTypes.PNG, outputResponseId: 'index' };
const getMapParamsEmptyOutputResponseId = { ...getMapParams, outputResponseId: '' };

const buffer = new ArrayBuffer(8);
const mockedResponse = (config: any): any => {
  if (config.responseType === 'arraybuffer') {
    return [200, buffer];
  }
};

beforeEach(async () => {
  await invalidateCaches();
});

test('Error if outputResponseId is used with WMS', async () => {
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layerWMS.getMap(getMapParamsDefaultResponseId, ApiType.WMS);
  } catch (e) {
    expect(e.message).toBe('outputResponseId is only available with Processing API');
  }
});

test('Error if outputResponseId is empty and used with WMS', async () => {
  setAuthToken(EXAMPLE_TOKEN);
  try {
    await layerWMS.getMap(getMapParamsEmptyOutputResponseId, ApiType.WMS);
  } catch (e) {
    expect(e.message).toBe('outputResponseId is only available with Processing API');
  }
});

it('NO output response id, JPEG format', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;

  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layerProcessing.getMap(getMapParams, ApiType.PROCESSING);

  const request = mockNetwork.history.post[0];
  const requestData = JSON.parse(request.data);
  expect(requestData.output.responses).toEqual([{ identifier: 'default', format: { type: 'image/jpeg' } }]);
});

it('EMPTY output response id, JPEG format', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layerProcessing.getMap(getMapParamsEmptyOutputResponseId, ApiType.PROCESSING);

  const request = mockNetwork.history.post[0];
  const requestData = JSON.parse(request.data);
  expect(requestData.output.responses).toEqual([{ identifier: 'default', format: { type: 'image/jpeg' } }]);
});

it('DEFAULT output response, JPEG format', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layerProcessing.getMap(getMapParamsDefaultResponseId, ApiType.PROCESSING);

  const request = mockNetwork.history.post[0];
  const requestData = JSON.parse(request.data);
  expect(requestData.output.responses).toEqual([{ identifier: 'default', format: { type: 'image/jpeg' } }]);
});

it('INDEX output response, PNG format', async () => {
  // arrayBuffer needs to be used, and removing this will cause getMap to fetch a blob, as window.Blob was created with jsdom
  window.Blob = undefined;
  setAuthToken(EXAMPLE_TOKEN);
  mockNetwork.reset();
  mockNetwork.onPost().replyOnce(200, mockedResponse);

  await layerProcessing.getMap(getMapParamsIndexResponseId, ApiType.PROCESSING);

  const request = mockNetwork.history.post[0];
  const requestData = JSON.parse(request.data);
  expect(requestData.output.responses).toEqual([{ identifier: 'index', format: { type: 'image/png' } }]);
});
