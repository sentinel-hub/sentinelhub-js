import moment from 'moment';

import { LinkType, S2L1CLayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T10:09:25Z',
  hasMore = true,
}): Record<any, any> {
  const fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layer = new S2L1CLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: 20,
  });

  const expectedRequest = {
    clipping: {
      type: 'Polygon',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
      coordinates: [
        [
          [19, 20],
          [20, 20],
          [20, 21],
          [19, 21],
          [19, 20],
        ],
      ],
    },
    maxcount: 5,
    maxCloudCoverage: 0.2,
    timeFrom: '2020-04-01T00:00:00.000Z',
    timeTo: '2020-05-01T23:59:59.999Z',
    offset: 0,
  };

  const mockedResponse = {
    tiles: [
      {
        type: 'S2',
        id: 12649990,
        originalId: 'S2B_OPER_MSI_L1C_TL_MPS__20200430T120945_A016450_T32TPL_N02.09',
        dataUri: 's3://sentinel-s2-l1c/tiles/32/T/PL/2020/4/30/0',
        dataIndexUri: 's3://sentinel-s2-l1c-index/tiles/32/T/PL/2020/4/30/0',
        dataGeometry: {
          type: 'MultiPolygon',
          crs: {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:EPSG::4326',
            },
          },
          coordinates: [
            [
              [
                [11.024700825907713, 41.534007903511316],
                [10.721014448523226, 40.549938780257456],
                [11.47718665727451, 40.53619478067447],
                [11.514526068721082, 41.5243359587925],
                [11.024700825907713, 41.534007903511316],
              ],
            ],
          ],
        },
        cloudCoverPercentage: 0.95,
        sensingTime: '2020-04-30T10:09:25Z',
        unitsPerPixel: 10.0,
        area: 5.762832997652008e9,
        hasLowQuantification: false,
        dos1: {
          B01: -1175,
          B02: -759,
          B03: -370,
          B04: -158,
          B05: -127,
          B06: -97,
          B07: -79,
          B08: -36,
          B09: 0,
          B10: 0,
          B11: 0,
          B12: 0,
          B8A: -38,
        },
        productId: 'S2B_MSIL1C_20200430T100019_N0209_R122_T32TPL_20200430T120945',
        copernicusHubProductId: '08103dec-7cbd-4080-b996-13a373b2b5b9',
        l1cPath: 'tiles/32/T/PL/2020/4/30/0',
      },
    ],
    hasMore: hasMore,
    maxOrderKey: '2020-04-12T09:59:24Z;4.997170846080444E9;12425636;13.99',
  };
  const expectedResultTiles = [
    {
      geometry: {
        type: 'MultiPolygon',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:EPSG::4326',
          },
        },
        coordinates: [
          [
            [
              [11.024700825907713, 41.534007903511316],
              [10.721014448523226, 40.549938780257456],
              [11.47718665727451, 40.53619478067447],
              [11.514526068721082, 41.5243359587925],
              [11.024700825907713, 41.534007903511316],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [
        {
          target: 's3://sentinel-s2-l1c/tiles/32/T/PL/2020/4/30/0',
          type: LinkType.AWS,
        },
        {
          target: 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/32/T/PL/2020/4/30/0/preview.jpg',
          type: 'preview',
        },
      ],
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
