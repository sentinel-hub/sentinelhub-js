import { BBox, CRS_EPSG4326, GetMapParams, MimeTypes } from 'src';

const bbox4326 = new BBox(CRS_EPSG4326, 11.9, 42.05, 12.95, 43.09);

const getMapParams: GetMapParams = {
  bbox: bbox4326,
  fromTime: new Date(Date.UTC(2018, 11 - 1, 22, 0, 0, 0)),
  toTime: new Date(Date.UTC(2018, 12 - 1, 22, 23, 59, 59)),
  width: 256,
  height: 256,
  format: MimeTypes.JPEG,
};

const mockedLayersResponse = [
  {
    '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/INSTANCE_ID/layers/LAYER_ID',
    id: 'LAYER_ID',
    title: 'Title',
    description: 'Description',
    styles: [
      {
        name: 'default',
        description: 'Default layer style',
        evalScript:
          '//VERSION=3\nlet minVal = 0.0;\nlet maxVal = 0.4;\n\nlet viz = new HighlightCompressVisualizer(minVal, maxVal);\n\nfunction setup() {\n   return {\n    input: ["B04", "B03", "B02","dataMask"],\n    output: { bands: 4 }\n  };\n}\n\nfunction evaluatePixel(samples) {\n    let val = [samples.B04, samples.B03, samples.B02,samples.dataMask];\n    return viz.processList(val);\n}',
      },
    ],
    orderHint: 0,
    instance: {
      '@id': 'https://services.sentinel-hub.com/configuration/v1/wms/instances/INSTANCE_ID',
    },
    dataset: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A' },
    datasetSource: { '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/S2L2A/sources/2' },
    defaultStyleName: 'default',
    datasourceDefaults: {
      upsampling: 'BICUBIC',
      mosaickingOrder: 'mostRecent',
      temporal: false,
      maxCloudCoverage: 100.0,
      previewMode: 'EXTENDED_PREVIEW',
      type: 'S2L2A',
    },
  },
];

export const constructFixtureMosaickingOrder = () => {
  return {
    getMapParams: getMapParams,
    mockedLayersResponse: mockedLayersResponse,
  };
};
