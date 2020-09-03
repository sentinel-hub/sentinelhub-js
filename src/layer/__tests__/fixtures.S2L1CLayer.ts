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

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-08-23T10:09:17Z',
  hasMore = false,
}): Record<any, any> {
  const fromTime = new Date(Date.UTC(2020, 8 - 1, 23, 0, 0, 0, 0));
  const toTime = new Date(Date.UTC(2020, 8 - 1, 23, 23, 59, 59, 999));
  const bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21);
  const layer = new S2L1CLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: 20,
  });

  const expectedRequest = {
    bbox: [19, 20, 20, 21],
    datetime: '2020-08-23T00:00:00.000Z/2020-08-23T23:59:59.999Z',
    collections: ['sentinel-2-l1c'],
    limit: 5,
    query: { 'eo:cloud_cover': { lte: 20 } },
  };

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'S2A_MSIL1C_20200823T100031_N0209_R122_T32TQM_20200823T121427',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
          coordinates: [
            [
              [
                [11.430722251410344, 42.426902739014714],
                [11.393473068077842, 41.43885499414472],
                [12.705550887714065, 41.40404411804872],
                [12.763123791034824, 42.39087207237768],
                [11.430722251410344, 42.426902739014714],
              ],
            ],
          ],
        },
        bbox: [11.393473068077842, 41.40404411804872, 12.763123791034824, 42.426902739014714],
        stac_extensions: ['eo', 'projection'],
        type: 'Feature',
        properties: {
          datetime: '2020-08-23T10:09:17Z',
          'proj:epsg': 32632,
          instruments: ['msi'],
          constellation: 'sentinel-2',
          'proj:geometry': {
            crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32632' } },
            coordinates: [
              [
                [
                  [699961.0000825353, 4700039.000087841],
                  [699961.0000732796, 4590241.000068791],
                  [809759.0015583476, 4590241.000078244],
                  [809759.0017560651, 4700039.000100779],
                  [699961.0000825353, 4700039.000087841],
                ],
              ],
            ],
          },
          'eo:cloud_cover': 0.08,
          'eo:bands': [
            { name: 'B01', common_name: 'coastal', center_wavelength: 0.4427, full_width_half_max: 0.021 },
            { name: 'B02', common_name: 'blue', center_wavelength: 0.4924, full_width_half_max: 0.066 },
            { name: 'B03', common_name: 'green', center_wavelength: 0.5598, full_width_half_max: 0.036 },
            { name: 'B04', common_name: 'red', center_wavelength: 0.6646, full_width_half_max: 0.031 },
            { name: 'B05', center_wavelength: 0.7041, full_width_half_max: 0.015 },
            { name: 'B06', center_wavelength: 0.7405, full_width_half_max: 0.015 },
            { name: 'B07', center_wavelength: 0.7828, full_width_half_max: 0.02 },
            { name: 'B08', common_name: 'nir', center_wavelength: 0.8328, full_width_half_max: 0.106 },
            { name: 'B8A', common_name: 'nir08', center_wavelength: 0.8647, full_width_half_max: 0.021 },
            { name: 'B09', common_name: 'nir09', center_wavelength: 0.9451, full_width_half_max: 0.02 },
            { name: 'B10', common_name: 'cirrus', center_wavelength: 1.3735, full_width_half_max: 0.031 },
            { name: 'B11', common_name: 'swir16', center_wavelength: 1.6137, full_width_half_max: 0.091 },
            { name: 'B12', common_name: 'swir22', center_wavelength: 2.2024, full_width_half_max: 0.175 },
          ],
          'eo:gsd': 10,
          'proj:bbox': [696896.5684521495, 4586375.95284284, 814572.5734874466, 4704040.517882267],
          platform: 'sentinel-2a',
        },
        links: [
          {
            href:
              'https://services.sentinel-hub.com/api/v1/catalog/collections/sentinel-2-l1c/items/S2A_MSIL1C_20200823T100031_N0209_R122_T32TQM_20200823T121427',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://services.sentinel-hub.com/api/v1/catalog/collections/sentinel-2-l1c',
            rel: 'parent',
          },
          {
            href:
              "https://scihub.copernicus.eu/dhus/odata/v1/Products('966aba13-b34f-4563-85ae-356503fb6c7b')/$value",
            rel: 'derived_from',
            title: 'scihub download',
          },
        ],
        assets: {
          thumbnail: {
            href: 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/32/T/QM/2020/8/23/0/preview.jpg',
            title: 'thumbnail',
            type: 'image/png',
          },
          data: {
            href: 's3://sentinel-s2-l1c/tiles/32/T/QM/2020/8/23/0/',
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
            name: 'urn:ogc:def:crs:EPSG::4326',
          },
        },
        coordinates: [
          [
            [
              [11.430722251410344, 42.426902739014714],
              [11.393473068077842, 41.43885499414472],
              [12.705550887714065, 41.40404411804872],
              [12.763123791034824, 42.39087207237768],
              [11.430722251410344, 42.426902739014714],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 0.08,
        MGRSLocation: '32TQM',
      },
      links: [
        {
          target: 's3://sentinel-s2-l1c/tiles/32/T/QM/2020/8/23/0/',
          type: LinkType.AWS,
        },
        {
          target: 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/32/T/QM/2020/8/23/0/preview.jpg',
          type: 'preview',
        },
        {
          target:
            "https://scihub.copernicus.eu/dhus/odata/v1/Products('966aba13-b34f-4563-85ae-356503fb6c7b')/$value",
          type: LinkType.SCIHUB,
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
