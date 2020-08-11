import { DATASET_S2L1C } from '../..';

export function constructFixtureGetCapabilities(): Record<any, any> {
  const url = 'https://services.sentinel-hub.com/ogc/wms/mocked_instanceID_1234';

  const mockedResponse = {
    title: 'Mocked response',
    layers: [
      {
        id: '2-FALSE-COLOR',
        name: 'False Color',
        description: 'Based on bands 2, 1, 4',
        dataset: DATASET_S2L1C.shJsonGetCapabilitiesDataset,
      },
      {
        id: '3-NDVI',
        name: 'NDVI',
        description: 'Based on combination of bands (B02 - B01)/(B02 + B01)',
        dataset: DATASET_S2L1C.shJsonGetCapabilitiesDataset,
      },
      {
        id: 'NDWI',
        name: 'NDWI',
        description: 'Based on combination of bands (B02 - B05)/(B02 + B05)',
        dataset: DATASET_S2L1C.shJsonGetCapabilitiesDataset,
      },
    ],
    datasets: [
      {
        name: DATASET_S2L1C.shJsonGetCapabilitiesDataset,
        bands: ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07'],
      },
    ],
  };

  return {
    url: url,
    mockedResponse: mockedResponse,
    expectedCapabilities: mockedResponse.layers,
  };
}
