import moment from 'moment';

import { BYOCLayer, BBox, CRS_EPSG4326, LocationIdSHv3, BYOCSubTypes } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-04T10:19:39.900Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  collectionId = 'fafb9454-80ea-431d-b36f-a127faa929c7',
  locationId = LocationIdSHv3.awsEuCentral1,
}): Record<any, any> {
  const layer = new BYOCLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    collectionId: collectionId,
    locationId: locationId,
  });

  const expectedRequest = {
    clipping: {
      type: 'Polygon',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
      coordinates: [
        [
          [bbox.minX, bbox.minY],
          [bbox.maxX, bbox.minY],
          [bbox.maxX, bbox.maxY],
          [bbox.minX, bbox.maxY],
          [bbox.minX, bbox.minY],
        ],
      ],
    },
    maxCloudCoverage: null as any,
    maxcount: 5,
    timeFrom: fromTime.toISOString(),
    timeTo: toTime.toISOString(),
    offset: 0,
    datasetParameters: { type: 'BYOC', collectionId: collectionId },
  };

  const mockedResponse = {
    tiles: [
      {
        type: 'BYOC',
        id: 118402,
        originalId: 'a6e798fe-550c-4e5b-beb0-6bb22b37dd75',
        dataUri:
          's3://sh.tpdi.byoc.eu-central-1/42f086c7-d327-4e93-ac15-48008abf24b2/c9320284-761f-4d7c-a78c-83f77bf1c585/PHR1B_202004041019399_ORT_6ae5fb8f_R1C1/(BAND).tiff',
        tileEnvelope: {
          type: 'Polygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32633' } },
          coordinates: [
            [
              [267100.0, 4637458.0],
              [274984.0, 4637458.0],
              [274984.0, 4627238.0],
              [267100.0, 4627238.0],
              [267100.0, 4637458.0],
            ],
          ],
        },
        dataGeometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32633' } },
          coordinates: [
            [
              [
                [273582.9992657101, 4637457.000306206],
                [270732.7491996665, 4636314.750305427],
                [267100.9991082235, 4634861.0003044875],
                [268873.1909535045, 4627238.000299189],
                [269848.98796083464, 4627773.219263511],
                [274983.9993020628, 4630595.112849303],
                [274983.82442607975, 4630600.773689148],
                [274216.6154533472, 4634370.86926318],
                [273590.2492658865, 4637441.750306196],
                [273587.22117591917, 4637455.593002837],
                [273582.9992657101, 4637457.000306206],
              ],
            ],
          ],
        },
        sensingTime: '2020-04-04T10:19:39.900Z',
      },
    ],
    hasMore: hasMore,
    maxOrderKey: '2020-02-08T10:00:00.300Z;147290',
  };
  const expectedResultTiles = [
    {
      geometry: {
        type: 'MultiPolygon',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:EPSG::32633',
          },
        },
        coordinates: [
          [
            [
              [273582.9992657101, 4637457.000306206],
              [270732.7491996665, 4636314.750305427],
              [267100.9991082235, 4634861.0003044875],
              [268873.1909535045, 4627238.000299189],
              [269848.98796083464, 4627773.219263511],
              [274983.9993020628, 4630595.112849303],
              [274983.82442607975, 4630600.773689148],
              [274216.6154533472, 4634370.86926318],
              [273590.2492658865, 4637441.750306196],
              [273587.22117591917, 4637455.593002837],
              [273582.9992657101, 4637457.000306206],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
    },
  ];
  return {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    layer: layer,
    mockedResponse: mockedResponse,
    expectedRequest: expectedRequest,
    expectedResultTiles: expectedResultTiles,
    expectedResultHasMore: hasMore,
  };
}

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-04-04T10:19:39Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  collectionId = 'fafb9454-80ea-431d-b36f-a127faa929c7',
  locationId = LocationIdSHv3.awsEuCentral1,
  subType = BYOCSubTypes.BYOC,
}): Record<any, any> {
  const layer = new BYOCLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    collectionId: collectionId,
    locationId: locationId,
    subType: subType,
  });

  const expectedRequest = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: [`${subType === BYOCSubTypes.BATCH ? 'batch' : 'byoc'}-${collectionId}`],
    limit: 5,
  };

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'a6e798fe-550c-4e5b-beb0-6bb22b37dd75',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [12.272305762310202, 41.85663957242283],
                [12.23844880086131, 41.84554308794343],
                [12.19532566224936, 41.83140530733394],
                [12.219610909737291, 41.763345066942115],
                [12.231129048241453, 41.768443531961466],
                [12.291770559105906, 41.79530366262276],
                [12.29176631097997, 41.7953545430824],
                [12.281107318551829, 41.82905539168778],
                [12.272398843179907, 41.8565044467963],
                [12.272357107347492, 41.85662811889274],
                [12.272305762310202, 41.85663957242283],
              ],
            ],
          ],
        },
        bbox: [12.19532566224936, 41.763345066942115, 12.291770559105906, 41.85663957242283],
        stac_extensions: ['projection'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-04T10:19:39Z',
          'proj:epsg': 32633,
          'proj:geometry': {
            crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32633' } },
            coordinates: [
              [
                [
                  [273582.9992657101, 4637457.000306206],
                  [270732.7491996665, 4636314.750305427],
                  [267100.9991082235, 4634861.0003044875],
                  [268873.1909535045, 4627238.000299189],
                  [269848.98796083464, 4627773.219263511],
                  [274983.9993020628, 4630595.112849303],
                  [274983.82442607975, 4630600.773689148],
                  [274216.6154533472, 4634370.86926318],
                  [273590.2492658865, 4637441.750306196],
                  [273587.22117591917, 4637455.593002837],
                  [273582.9992657101, 4637457.000306206],
                ],
              ],
            ],
          },
          'proj:bbox': [267100.9991082235, 4627238.000299189, 274983.9993020628, 4637457.000306206],
        },
        links: [
          {
            href:
              'https://services.sentinel-hub.com/api/v1/catalog/collections/3c4daecf-09f3-451c-8c3c-90e356cbd673/items/a6e798fe-550c-4e5b-beb0-6bb22b37dd75',
            rel: 'self',
            type: 'application/json',
          },
          {
            href:
              'https://services.sentinel-hub.com/api/v1/catalog/collections/3c4daecf-09f3-451c-8c3c-90e356cbd673',
            rel: 'parent',
          },
        ],
      },
    ],
    links: [
      {
        href: 'https://services.sentinel-hub.com/api/v1/catalog/search',
        rel: 'self',
        type: 'application/json',
      },
    ],
    context: { limit: 50, returned: 3 },
  };
  /* eslint-enable */

  const expectedResultTiles = [
    {
      geometry: {
        type: 'MultiPolygon',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC::CRS84',
          },
        },
        coordinates: [
          [
            [
              [12.272305762310202, 41.85663957242283],
              [12.23844880086131, 41.84554308794343],
              [12.19532566224936, 41.83140530733394],
              [12.219610909737291, 41.763345066942115],
              [12.231129048241453, 41.768443531961466],
              [12.291770559105906, 41.79530366262276],
              [12.29176631097997, 41.7953545430824],
              [12.281107318551829, 41.82905539168778],
              [12.272398843179907, 41.8565044467963],
              [12.272357107347492, 41.85662811889274],
              [12.272305762310202, 41.85663957242283],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [] as any,
    },
  ];
  return {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    layer: layer,
    mockedResponse: mockedResponse,
    expectedRequest: expectedRequest,
    expectedResultTiles: expectedResultTiles,
    expectedResultHasMore: hasMore,
  };
}

export function constructFixtureUpdateLayerFromServiceIfNeeded({
  collectionId = '0ed669e7-0f09-4909-9b9b-ffff1c9eaca5',
  locationId = LocationIdSHv3.awsEuCentral1,
}): Record<any, any> {
  const layer = new BYOCLayer({
    instanceId: 'cc6082af-2788-4b20-b0fe-54e13454bc66',
    layerId: 'BYOC3',
    collectionId: collectionId,
    locationId: locationId,
  });

  const mockedResponse = [
    {
      '@id':
        'https://services.sentinel-hub.com/api/v2/configuration/instances/cc6082af-2788-4b20-b0fe-54e13454bc66/layers/BYOC3',
      id: 'BYOC3',
      title: 'byoc3',
      description: '',
      styles: [
        {
          name: 'default',
          description: 'Default layer style',
          evalScript:
            '//VERSION=3\nfunction setup() {\nreturn {\n         input: ["IR", "G", "B"],\n          output: { bands: 3 }\n        };\n}\n\nfunction evaluatePixel(sample) {\n    return [sample.IR/255, sample.G/255, sample.B/255];\n}',
        },
      ],
      orderHint: 0,
      instance: {
        '@id':
          'https://services.sentinel-hub.com/api/v2/configuration/instances/cc6082af-2788-4b20-b0fe-54e13454bc66',
      },
      dataset: {
        '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/CUSTOM',
      },
      datasetSource: {
        '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/CUSTOM/sources/10',
      },
      defaultStyleName: 'default',
      datasourceDefaults: {
        timeRange: {
          startTime: {
            type: 'ABSOLUTE',
          },
          endTime: {
            type: 'ABSOLUTE',
          },
        },
        mosaickingOrder: 'mostRecent',
        temporal: false,
        collectionId: '0ed669e7-0f09-4909-9b9b-ffff1c9eaca5',
        type: 'CUSTOM',
      },
    },
    {
      '@id':
        'https://services.sentinel-hub.com/api/v2/configuration/instances/cc6082af-2788-4b20-b0fe-54e13454bc66/layers/BYOC_AZER_SKY_TRUE_COLOR',
      id: 'BYOC_AZER_SKY_TRUE_COLOR',
      title: 'BYOC_AZER_SKY_TRUE_COLOR',
      description: '',
      styles: [
        {
          name: 'default',
          description: 'Default layer style',
          evalScript:
            '//VERSION=3\n//This script was converted from v1 to v3 using the converter API\n\nfunction evaluatePixel(samples) {\n  let r = Math.cbrt(samples.R * 0.000375);\n  let g = Math.cbrt(samples.G * 0.000375);\n  let b = Math.cbrt(samples.B * 0.000375);\n  return [r*r,g*g,b*b];\n}\n\nfunction setup() {\n  return {\n    input: [{\n      bands: [\n        "R",\n        "G",\n        "B"\n      ]\n    }],\n    output: {\n      bands: 3\n    }\n  }\n}\n',
        },
      ],
      orderHint: 0,
      instance: {
        '@id':
          'https://services.sentinel-hub.com/api/v2/configuration/instances/cc6082af-2788-4b20-b0fe-54e13454bc66',
      },
      dataset: {
        '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/CUSTOM',
      },
      datasetSource: {
        '@id': 'https://services.sentinel-hub.com/configuration/v1/datasets/CUSTOM/sources/10',
      },
      defaultStyleName: 'default',
      datasourceDefaults: {
        mosaickingOrder: 'mostRecent',
        temporal: false,
        collectionId: '70874d64-7ef0-4ec4-a302-b1f00649c78d',
        type: 'CUSTOM',
      },
    },
  ];

  const expectedLayerParams = {
    layerId: 'BYOC3',
    timeRange: { startTime: { type: 'ABSOLUTE' }, endTime: { type: 'ABSOLUTE' } },
    mosaickingOrder: 'mostRecent',
    temporal: false,
    collectionId: '0ed669e7-0f09-4909-9b9b-ffff1c9eaca5',
    type: 'CUSTOM',
    evalscript:
      '//VERSION=3\n' +
      'function setup() {\n' +
      'return {\n' +
      '         input: ["IR", "G", "B"],\n' +
      '          output: { bands: 3 }\n' +
      '        };\n' +
      '}\n' +
      '\n' +
      'function evaluatePixel(sample) {\n' +
      '    return [sample.IR/255, sample.G/255, sample.B/255];\n' +
      '}',
    dataProduct: undefined as any,
    legend: undefined as any,
    title: 'byoc3',
    description: '',
  };

  return {
    layer: layer,
    mockedResponse: mockedResponse,
    expectedLayerParams: expectedLayerParams,
  };
}
