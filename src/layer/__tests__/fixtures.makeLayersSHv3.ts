import { DATASET_S2L2A } from '../dataset';

export const getLayersFromConfigurationService = [
  {
    '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId/layers/1_TRUE_COLOR',
    id: '1_TRUE_COLOR',
    title: 'True color',
    description: 'Based on bands 4,3,2',
    styles: [
      {
        name: 'default',
        description: 'Default layer style',
        evalScript: 'True color evalscript',
      },
    ],
    orderHint: 0,
    instance: {
      '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId',
    },
    dataset: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A' },
    datasetSource: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/sources/2' },
    defaultStyleName: 'default',
    datasourceDefaults: {
      temporal: false,
      previewMode: 'EXTENDED_PREVIEW',
      type: 'S2L2A',
    },
  },
  {
    '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId/layers/8-NDSI',
    id: '8-NDSI',
    title: 'NDSI',
    description: 'Based on combination of bands (B3 - B11)/(B3 + B11)',
    styles: [
      {
        name: 'default',
        description: 'Default layer style',
        evalScript: 'NDSI evalscript',
        legend: { type: 'discrete', items: [{ color: 'rgb(0%, 50%, 100%)', label: 'Snow' }] },
      },
    ],
    orderHint: 70,
    instance: {
      '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId',
    },
    dataset: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A' },
    datasetSource: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/sources/2' },
    defaultStyleName: 'default',
    datasourceDefaults: {
      upsampling: 'NEAREST',
      downsampling: 'NEAREST',
      mosaickingOrder: 'leastRecent',
      temporal: false,
      maxCloudCoverage: 50.0,
      type: 'S2L2A',
    },
  },
  {
    '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId',
    id: 'B8A',
    title: 'B8A',
    description: 'Band 8A - Vegetation Red Edge - 865 nm|#bc0e10',
    styles: [
      {
        name: 'default',
        description: 'Default layer style',
        dataProduct: {
          '@id':
            'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/dataproducts/dataProductId',
        },
      },
    ],
    orderHint: 0,
    instance: {
      '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/instanceId',
    },
    dataset: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A' },
    datasetSource: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/sources/2' },
    defaultStyleName: 'default',
    datasourceDefaults: {
      mosaickingOrder: 'mostRecent',
      temporal: false,
      maxCloudCoverage: 20.0,
      type: 'S2L2A',
    },
  },
];

export const getLayersFromJsonCapabilities = {
  title: 'EO_Browser-Sentinel-2-L2A API production',
  layers: [
    {
      id: '1_TRUE_COLOR',
      name: 'True color',
      description: 'Based on bands 4,3,2',
      dataset: 'S2L2A',
      legendUrl: null,
    },

    {
      id: '8-NDSI',
      name: 'NDSI',
      description: 'Based on combination of bands (B3 - B11)/(B3 + B11)',
      dataset: 'S2L2A',
      legendUrl:
        'https://services.sentinel-hub.com/ogc/wms/instanceId?request=GetLegendGraphic&service=WMS&layer=8-NDSI&style=default',
    },
    {
      id: 'B8A',
      name: 'B8A',
      description: 'Band 8A - Vegetation Red Edge - 865 nm|#bc0e10',
      dataset: 'S2L2A',
      legendUrl: null,
    },
  ],
  datasets: [
    {
      name: 'S2L2A',
      bands: ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B8A', 'B09', 'B11', 'B12'],
    },
  ],
};

export const expectedResultJsonCapabilities = (
  overrideConstructorParams: Record<string, any> = {},
): Record<string, any>[] => [
  {
    layerId: '1_TRUE_COLOR',
    title: 'True color',
    description: 'Based on bands 4,3,2',
    dataset: DATASET_S2L2A,
    legendUrl: null as string,
    evalscript: null as string,
    evalscriptUrl: null as string,
    dataProduct: null as string,
    upsampling: null as string,
    downsampling: null as string,
    mosaickingOrder: null as string,
    maxCloudCoverPercent: 100.0,
    ...overrideConstructorParams,
  },
  {
    layerId: '8-NDSI',
    title: 'NDSI',
    description: 'Based on combination of bands (B3 - B11)/(B3 + B11)',
    dataset: DATASET_S2L2A,
    legendUrl:
      'https://services.sentinel-hub.com/ogc/wms/instanceId?request=GetLegendGraphic&service=WMS&layer=8-NDSI&style=default',
    evalscript: null as string,
    evalscriptUrl: null as string,
    dataProduct: null as string,
    upsampling: null as string,
    downsampling: null as string,
    mosaickingOrder: null as string,
    maxCloudCoverPercent: 100.0,
    ...overrideConstructorParams,
  },
  {
    layerId: 'B8A',
    title: 'B8A',
    description: 'Band 8A - Vegetation Red Edge - 865 nm|#bc0e10',
    dataset: DATASET_S2L2A,
    legendUrl: null as string,
    evalscript: null as string,
    evalscriptUrl: null as string,
    dataProduct: null as string,
    upsampling: null as string,
    downsampling: null as string,
    mosaickingOrder: null as string,
    maxCloudCoverPercent: 100.0,
    ...overrideConstructorParams,
  },
];

export const expectedResultConfigurationService = (
  overrideConstructorParams: Record<string, any> = {},
): Record<string, any>[] => [
  {
    layerId: '1_TRUE_COLOR',
    title: 'True color',
    description: 'Based on bands 4,3,2',
    dataset: DATASET_S2L2A,
    legendUrl: null as string,
    evalscript: 'True color evalscript',
    evalscriptUrl: null as string,
    dataProduct: null as string,
    upsampling: null as string,
    downsampling: null as string,
    mosaickingOrder: null as string,
    maxCloudCoverPercent: 100.0,
    ...overrideConstructorParams,
  },
  {
    layerId: '8-NDSI',
    title: 'NDSI',
    description: 'Based on combination of bands (B3 - B11)/(B3 + B11)',
    dataset: DATASET_S2L2A,
    legendUrl:
      'https://services.sentinel-hub.com/ogc/wms/instanceId?request=GetLegendGraphic&service=WMS&layer=8-NDSI&style=default',
    evalscript: 'NDSI evalscript',
    evalscriptUrl: null as string,
    dataProduct: null as string,
    upsampling: 'NEAREST',
    downsampling: 'NEAREST',
    mosaickingOrder: 'leastRecent',
    maxCloudCoverPercent: 50.0,
    ...overrideConstructorParams,
  },
  {
    layerId: 'B8A',
    title: 'B8A',
    description: 'Band 8A - Vegetation Red Edge - 865 nm|#bc0e10',
    dataset: DATASET_S2L2A,
    legendUrl: null as string,
    evalscript: null as string,
    evalscriptUrl: null as string,
    dataProduct:
      'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/dataproducts/dataProductId',
    upsampling: null as string,
    downsampling: null as string,
    mosaickingOrder: 'mostRecent',
    maxCloudCoverPercent: 20.0,
    ...overrideConstructorParams,
  },
];
