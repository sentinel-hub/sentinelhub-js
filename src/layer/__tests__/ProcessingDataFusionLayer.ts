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
} from '../../index';
import { DataFusionLayerInfo, DEFAULT_SH_SERVICE_HOSTNAME } from '../ProcessingDataFusionLayer';
import '../../../jest-setup';

const mockNetwork = new MockAdapter(axios);

const mockEvalscript = '\\VERSION=3\n';

describe("Test data fusion uses correct URL depending on layers' combination", () => {
  const shServicesLayer = new S2L1CLayer({ evalscript: mockEvalscript });
  const creodiasLayer = new S3OLCILayer({ evalscript: mockEvalscript });
  const usWestLayer = new Landsat8AWSLayer({ evalscript: mockEvalscript });

  test.each([
    [[shServicesLayer, shServicesLayer], shServicesLayer.dataset.shServiceHostname],
    [[creodiasLayer, shServicesLayer, usWestLayer], DEFAULT_SH_SERVICE_HOSTNAME],
    [[creodiasLayer, creodiasLayer], creodiasLayer.dataset.shServiceHostname],
  ])(
    'ProcessingDataFusionLayer chooses the correct shServiceHostname',
    async (layers, expectedShServiceHostname) => {
      const fromTime = new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0));
      const toTime = new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59));
      const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);

      const layerInfo: DataFusionLayerInfo[] = layers.map(layer => ({ layer: layer }));
      const dataFusionLayer = new ProcessingDataFusionLayer({
        evalscript: mockEvalscript,
        evalscriptUrl: null,
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
        .catch(() => null);

      expect(mockNetwork.history.post[0].url).toBe(`${expectedShServiceHostname}api/v1/process`);
    },
  );
});
