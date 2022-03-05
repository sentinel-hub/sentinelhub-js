import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  ProcessingDataFusionLayer,
  S2L1CLayer,
  S3OLCILayer,
  Landsat8AWSLayer,
  ApiType,
  MimeTypes,
  BBox,
  CRS_EPSG4326,
  S1GRDAWSEULayer,
  Polarization,
} from '../../index';
import { DataFusionLayerInfo, DEFAULT_SH_SERVICE_HOSTNAME } from '../ProcessingDataFusionLayer';
import '../../../jest-setup';
import { DEMInstanceTypeOrthorectification } from '../const';
import { constructFixtureGetMapRequest } from './fixtures.ProcessingDataFusionLayer';
import { AcquisitionMode, Resolution } from '../S1GRDAWSEULayer';

const mockNetwork = new MockAdapter(axios);

const mockEvalscript = '\\VERSION=3\n';

describe("Test data fusion uses correct URL depending on layers' combination", () => {
  const shServicesLayer = new S2L1CLayer({ evalscript: mockEvalscript });
  const creodiasLayer = new S3OLCILayer({ evalscript: mockEvalscript });
  const usWestLayer = new Landsat8AWSLayer({ evalscript: mockEvalscript });

  const fromTime = new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0));
  const toTime = new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

  test.each([
    [[shServicesLayer, shServicesLayer], shServicesLayer.dataset.shServiceHostname],
    [[creodiasLayer, shServicesLayer, usWestLayer], DEFAULT_SH_SERVICE_HOSTNAME],
    [[creodiasLayer, creodiasLayer], creodiasLayer.dataset.shServiceHostname],
  ])(
    'ProcessingDataFusionLayer chooses the correct shServiceHostname',
    async (layers, expectedShServiceHostname) => {
      const layerInfo: DataFusionLayerInfo[] = layers.map(layer => ({ layer: layer }));
      const dataFusionLayer = new ProcessingDataFusionLayer({
        evalscript: mockEvalscript,
        layers: layerInfo,
      });

      mockNetwork.resetHistory();
      await dataFusionLayer
        .getMap(
          { bbox: bbox, fromTime: fromTime, toTime: toTime, format: MimeTypes.PNG },
          ApiType.PROCESSING,
          {
            authToken: 'some-token',
          },
        )
        .catch(() => {});

      expect(mockNetwork.history.post[0].url).toBe(`${expectedShServiceHostname}api/v1/process`);
    },
  );
});

describe('Test data fusion passes layer parameters correctly', () => {
  const s2Layer = new S2L1CLayer({ evalscript: mockEvalscript });
  const s1Layer = new S1GRDAWSEULayer({
    polarization: Polarization.DV,
    resolution: Resolution.HIGH,
    acquisitionMode: AcquisitionMode.IW,
    evalscript: mockEvalscript,
    orthorectify: true,
    demInstanceType: DEMInstanceTypeOrthorectification.COPERNICUS_90,
  });

  const fromTime = new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0));
  const toTime = new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

  test.each([
    [
      [s2Layer, s1Layer],
      [
        {
          dataFilter: {
            maxCloudCoverage: 100,
            mosaickingOrder: 'mostRecent',
            timeRange: {
              from: fromTime.toISOString(),
              to: toTime.toISOString(),
            },
          },
          processing: {},
          type: 'S2L1C',
        },
        {
          dataFilter: {
            acquisitionMode: 'IW',
            mosaickingOrder: 'mostRecent',
            polarization: 'DV',
            resolution: 'HIGH',
            timeRange: {
              from: fromTime.toISOString(),
              to: toTime.toISOString(),
            },
          },
          processing: {
            backCoeff: 'GAMMA0_ELLIPSOID',
            orthorectify: true,
            demInstance: 'COPERNICUS_90',
            speckleFilter: null,
          },
          type: 'S1GRD',
        },
      ],
    ],
  ])('ProcessingDataFusionLayer passes the correct parameters', async (layers, expectedData) => {
    const layerInfo: DataFusionLayerInfo[] = layers.map(layer => ({ layer: layer }));
    const dataFusionLayer = new ProcessingDataFusionLayer({
      evalscript: mockEvalscript,
      layers: layerInfo,
    });

    mockNetwork.resetHistory();
    await dataFusionLayer
      .getMap(
        { bbox: bbox, fromTime: fromTime, toTime: toTime, format: MimeTypes.PNG, width: 300, height: 400 },
        ApiType.PROCESSING,
        {
          authToken: 'some-token',
        },
      )
      .catch(() => {});

    const request = mockNetwork.history.post[0];

    const { expectedRequest } = constructFixtureGetMapRequest({
      bbox,
      evalscript: mockEvalscript,
      width: 300,
      height: 400,
      data: expectedData,
      format: MimeTypes.PNG,
    });
    expect(request.data).not.toBeNull();
    expect(JSON.parse(request.data)).toStrictEqual(expectedRequest);
  });
});
