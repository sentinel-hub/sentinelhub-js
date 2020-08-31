import moment from 'moment';

import { LinkType, S3SLSTRLayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T10:09:25Z',
  hasMore = true,
}): Record<any, any> {
  const fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layer = new S3SLSTRLayer({
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

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-08-01T21:06:51.776Z',
  hasMore = false,
}): Record<any, any> {
  const fromTime = new Date(Date.UTC(2020, 8 - 1, 1, 0, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 8 - 1, 1, 23, 59, 59, 999));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layer = new S3SLSTRLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: 60,
  });

  const expectedRequest = {
    bbox: [19, 20, 20, 21],
    datetime: '2020-08-01T00:00:00.000Z/2020-08-01T23:59:59.999Z',
    collections: ['sentinel-3-slstr'],
    limit: 5,
    query: { 'eo:cloud_cover': { lte: 60 } },
  };

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id:
          'S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [12.135434112664026, 32.615651480391286],
                [9.464415567565922, 43.20644666984989],
                [4.671062624980291, 42.394469244324796],
                [-0.05607824777853578, 41.37184865742768],
                [1.9178884476856943, 36.37098066829659],
                [3.8046657475730874, 30.91115609196735],
                [7.95825420030573, 31.83668786723435],
                [12.135434112664026, 32.615651480391286],
              ],
            ],
          ],
        },
        bbox: [-0.05607824777853578, 30.91115609196735, 12.135434112664026, 43.20644666984989],
        stac_extensions: ['eo', 'sat'],
        type: 'Feature',
        properties: {
          datetime: '2020-08-01T21:06:51.776Z',
          instruments: ['slstr'],
          'sat:orbit_state': 'ascending',
          'eo:bands': [
            { name: 'S01', center_wavelength: 0.55427, full_width_half_max: 0.01926 },
            { name: 'S02', center_wavelength: 0.65947, full_width_half_max: 0.01925 },
            { name: 'S03', center_wavelength: 0.868, full_width_half_max: 0.0206 },
            { name: 'S04', center_wavelength: 1.3748, full_width_half_max: 0.0208 },
            { name: 'S05', center_wavelength: 1.6134, full_width_half_max: 0.06068 },
            { name: 'S06', center_wavelength: 2.2557, full_width_half_max: 0.05015 },
            { name: 'S07', center_wavelength: 3.742, full_width_half_max: 0.398 },
            { name: 'S08', center_wavelength: 10.854, full_width_half_max: 0.776 },
            { name: 'S09', center_wavelength: 12.0225, full_width_half_max: 0.905 },
            { name: 'F01', center_wavelength: 3.742, full_width_half_max: 0.398 },
            { name: 'F02', center_wavelength: 10.854, full_width_half_max: 0.776 },
          ],
          'eo:cloud_cover': 11.539271354675293,
          'eo:gsd': 1000,
          platform: 'sentinel-3',
        },
        links: [
          {
            href:
              'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-3-slstr/items/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-3-slstr',
            rel: 'parent',
          },
        ],
        assets: {
          thumbnail: {
            href:
              'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/08/01/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004-ql.jpg',
            title: 'thumbnail',
            type: 'image/jpeg',
          },
          data: {
            href:
              's3://EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/08/01/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3',
            title: 's3',
            type: 'inode/directory',
          },
        },
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
              [12.135434112664026, 32.615651480391286],
              [9.464415567565922, 43.20644666984989],
              [4.671062624980291, 42.394469244324796],
              [-0.05607824777853578, 41.37184865742768],
              [1.9178884476856943, 36.37098066829659],
              [3.8046657475730874, 30.91115609196735],
              [7.95825420030573, 31.83668786723435],
              [12.135434112664026, 32.615651480391286],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 11.539271354675293,
      },
      links: [
        {
          target:
            's3://EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/08/01/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3',
          type: LinkType.AWS,
        },
        {
          target:
            'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/08/01/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004-ql.jpg',
          type: 'preview',
        },
        {
          target:
            '/eodata/Sentinel-3/SLSTR/SL_1_RBT/2020/08/01/S3A_SL_1_RBT____20200801T210652_20200801T210952_20200801T232953_0179_061_143_0540_LN2_O_NR_004.SEN3',
          type: LinkType.CREODIAS,
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
