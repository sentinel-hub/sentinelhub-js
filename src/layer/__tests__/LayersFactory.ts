import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  DATASET_S2L2A,
  DATASET_S5PL2,
  DATASET_EOCLOUD_ENVISAT_MERIS,
  DATASET_AWS_LOTL1,
  DATASET_S2L1C,
  DATASET_CREODIAS_S2L1C,
} from '../dataset';
import { LayersFactory } from '../LayersFactory';
import { WmsLayer, setAuthToken, invalidateCaches, S2L1CCREOLayer } from '../../index';
import { S2L1CLayer } from '../S2L1CLayer';
import { S5PL2Layer } from '../S5PL2Layer';
import { getCapabilitiesWmsXmlResponse } from './fixtures.getCapabilitiesWMS';
import { getCapabilitiesWmtsXMLResponse } from './fixtures.getCapabilitiesWMTS';
import {
  getLayersFromConfigurationService,
  getLayersFromJsonCapabilities,
  expectedResultJsonCapabilities,
  expectedResultConfigurationService,
} from './fixtures.makeLayersSHv3';
import { WmtsLayer } from '../WmtsLayer';
import { S2L2ALayer } from '../S2L2ALayer';

const mockNetwork = new MockAdapter(axios);

const cases = [
  {
    url: `${DATASET_S2L1C.shServiceHostname}ogc/wms/instanceID`,
    response: {
      layers: [
        {
          id: 'S2L1C',
          name: 's2l1c',
          description: '',
          dataset: 'S2L1C',
          legendUrl: '',
        },
      ],
    },
    expectedInstanceType: S2L1CLayer,
  },

  {
    url: `${DATASET_CREODIAS_S2L1C.shServiceHostname}ogc/wms/instanceID`,
    response: {
      layers: [
        {
          id: 'S2L1C',
          name: 's2l1c',
          description: '',
          dataset: 'S2L1C',
          legendUrl: '',
        },
      ],
    },
    expectedInstanceType: S2L1CCREOLayer,
  },

  {
    url: `${DATASET_S5PL2.shServiceHostname}ogc/wms/`,
    response: {
      layers: [
        {
          dataset: 'S5PL2',
          description: '',
          id: 'S5TMP',
          name: 's5tmp',
        },
      ],
    },
    expectedInstanceType: S5PL2Layer,
  },

  {
    url: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
    response: getCapabilitiesWmsXmlResponse,
    expectedInstanceType: WmsLayer,
  },
  {
    url: 'https://api.planet.com/basemaps/v1/mosaics/wmts',
    response: getCapabilitiesWmtsXMLResponse,
    expectedInstanceType: WmtsLayer,
  },
];

describe('Test LayersFactory', () => {
  test.each(cases)(
    'Given url returns correct Layer type',
    async ({ url, response, expectedInstanceType }) => {
      setAuthToken('a123');
      mockNetwork.reset();
      mockNetwork.onAny().replyOnce(200, response); // we don't care about the response, we will just inspect the request params
      const layer = (await LayersFactory.makeLayers(url, null))[0];

      expect(layer).toBeInstanceOf(expectedInstanceType);
    },
  );
});

describe('Test endpoints for getting layers parameters', () => {
  beforeEach(async () => {
    await invalidateCaches();
    mockNetwork.reset();
    setAuthToken(null);
  });

  it.each([
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: true,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: false,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        //not authenticated
        return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: false,
        authToken: 'authToken',
      },
      [{ code: 200, data: [] }],
      function expectedEndpoint(instanceId: string): string {
        return `https://services.sentinel-hub.com/configuration/v1/wms/instances/${instanceId}/layers`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: false,
        authToken: 'authToken',
      },
      [{ code: 401 }, { code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],

    [
      {
        baseUrl: `${DATASET_AWS_LOTL1.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://services-uswest2.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_S5PL2.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://creodias.sentinel-hub.com/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_EOCLOUD_ENVISAT_MERIS.shServiceHostname}v1/wms/`,
        instanceId: '3d0a2106-affd-11ec-b909-0242ac120002',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
      },
    ],
    [
      {
        baseUrl: `${DATASET_EOCLOUD_ENVISAT_MERIS.shServiceHostname}v1/wms/`,
        instanceId: '3d0a2106-affd-11ec-b909-0242ac120002',
        preferGetCapabilities: false,
        authToken: 'token',
      },
      [{ code: 200, data: { layers: [] } }],
      function expectedEndpoint(instanceId: string): string {
        return `https://eocloud.sentinel-hub.com/v1/config/instance/instance.${instanceId}?scope=ALL`;
      },
    ],
    [
      {
        baseUrl: `https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows`,
        instanceId: '',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: getCapabilitiesWmsXmlResponse }],
      function expectedEndpoint(): string {
        return `https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows?service=wms&request=GetCapabilities&format=text%2Fxml`;
      },
    ],
    [
      {
        baseUrl: `https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows`,
        instanceId: '',
        preferGetCapabilities: false,
        authToken: 'token',
      },
      [{ code: 200, data: getCapabilitiesWmsXmlResponse }],
      function expectedEndpoint(): string {
        return `https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows?service=wms&request=GetCapabilities&format=text%2Fxml`;
      },
    ],
    [
      {
        baseUrl: `https://api.planet.com/basemaps/v1/mosaics/wmts`,
        instanceId: '',
        preferGetCapabilities: undefined,
        authToken: undefined,
      },
      [{ code: 200, data: getCapabilitiesWmtsXMLResponse }],
      function expectedEndpoint(): string {
        return `https://api.planet.com/basemaps/v1/mosaics/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml`;
      },
    ],
    [
      {
        baseUrl: `https://api.planet.com/basemaps/v1/mosaics/wmts`,
        instanceId: '',
        preferGetCapabilities: false,
        authToken: 'token',
      },
      [{ code: 200, data: getCapabilitiesWmtsXMLResponse }],
      function expectedEndpoint(): string {
        return `https://api.planet.com/basemaps/v1/mosaics/wmts?service=wmts&request=GetCapabilities&format=text%2Fxml`;
      },
    ],
  ])('checks if correct endpoint is used', async (inputParams, responses, expectedEndpoint) => {
    const { baseUrl, instanceId, preferGetCapabilities, authToken } = inputParams;

    if (!!authToken) {
      setAuthToken(authToken);
    }
    responses.forEach((response: Record<string, any>) => {
      mockNetwork.onGet().replyOnce(response.code, response.data);
    });
    await LayersFactory.makeLayers(baseUrl + instanceId, null, null, null, preferGetCapabilities);
    expect(mockNetwork.history.get.length).toBe(responses.length);
    expect(mockNetwork.history.get[responses.length - 1].url).toBe(expectedEndpoint(instanceId));
  });
});

describe('Test makeLayersSHv3', () => {
  beforeEach(async () => {
    await invalidateCaches();
    mockNetwork.reset();
    setAuthToken(null);
  });

  it.each([
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: undefined,
        authToken: undefined,
        overrideConstructorParams: undefined,
      },
      [{ code: 200, data: getLayersFromJsonCapabilities }],
      expectedResultJsonCapabilities,
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: false,
        authToken: 'token',
        overrideConstructorParams: undefined,
      },
      [{ code: 200, data: getLayersFromConfigurationService }],
      expectedResultConfigurationService,
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: undefined,
        authToken: undefined,
        overrideConstructorParams: { upsampling: 'NN', maxCloudCoverPercent: 25 },
      },
      [{ code: 200, data: getLayersFromJsonCapabilities }],
      expectedResultJsonCapabilities,
    ],
    [
      {
        baseUrl: `${DATASET_S2L2A.shServiceHostname}ogc/wms/`,
        instanceId: 'instanceId',
        preferGetCapabilities: false,
        authToken: 'token',
        overrideConstructorParams: { upsampling: 'NN', maxCloudCoverPercent: 25 },
      },
      [{ code: 200, data: getLayersFromConfigurationService }],
      expectedResultConfigurationService,
    ],
    ,
  ])('test result of makeLayersSHv3 ', async (inputParams, responses, expectedResult) => {
    const { baseUrl, instanceId, preferGetCapabilities, authToken, overrideConstructorParams } = inputParams;

    if (!!authToken) {
      setAuthToken(authToken);
    }
    responses.forEach((response: Record<string, any>) => {
      mockNetwork.onGet().replyOnce(response.code, response.data);
    });
    const layers = await LayersFactory.makeLayers(
      baseUrl + instanceId,
      null,
      overrideConstructorParams,
      null,
      preferGetCapabilities,
    );
    expect(mockNetwork.history.get.length).toBe(responses.length);
    const expected = expectedResult(overrideConstructorParams);
    expect(layers.length).toBe(expected.length);
    layers.forEach((layer: S2L2ALayer, i) => {
      expect(layer.getLayerId()).toEqual(expected[i].layerId);
      expect(layer.title).toEqual(expected[i].title);
      expect(layer.description).toEqual(expected[i].description);
      expect(layer.dataset).toEqual(expected[i].dataset);
      expect(layer.getEvalscript()).toEqual(expected[i].evalscript);
      expect(layer.getDataProduct()).toEqual(expected[i].dataProduct);
      expect(layer.upsampling).toEqual(expected[i].upsampling);
      expect(layer.downsampling).toEqual(expected[i].downsampling);
      expect(layer.mosaickingOrder).toEqual(expected[i].mosaickingOrder);
      expect(layer.maxCloudCoverPercent).toEqual(expected[i].maxCloudCoverPercent);
    });
  });
});
