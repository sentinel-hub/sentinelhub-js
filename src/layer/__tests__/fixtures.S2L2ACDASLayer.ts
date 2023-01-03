import moment from 'moment';

import { LinkType, BBox, CRS_EPSG4326, S2L2ACDASLayer } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T10:09:22Z',
  hasMore = true,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new S2L2ACDASLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: maxCloudCoverPercent,
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
    maxcount: 5,
    maxCloudCoverage: maxCloudCoverPercent !== null ? maxCloudCoverPercent / 100 : null,
    timeFrom: fromTime.toISOString(),
    timeTo: toTime.toISOString(),
    offset: 0,
  };

  const mockedResponse = {
    tiles: [
      {
        type: 'S2',
        id: 9299470,
        originalId: 'S2B_OPER_MSI_L2A_TL_MPS__20200430T131222_A016450_T32TQL_N02.14',
        dataUri: 's3://sentinel-s2-l2a/tiles/32/T/QL/2020/4/30/0',
        dataIndexUri: 's3://sentinel-s2-l2a-index/tiles/32/T/QL/2020/4/30/0',
        tileEnvelope: {
          type: 'Polygon',
          crs: {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:EPSG::32632',
            },
          },
          coordinates: [
            [
              [699960.0, 4600020.0],
              [809760.0, 4600020.0],
              [809760.0, 4490220.0],
              [699960.0, 4490220.0],
              [699960.0, 4600020.0],
            ],
          ],
        },
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
                [11.396715230122707, 41.52685304084347],
                [11.361121157317946, 40.53862626065115],
                [12.655543739210799, 40.504895198570296],
                [12.71056219697988, 41.49193502979004],
                [11.396715230122707, 41.52685304084347],
              ],
            ],
          ],
        },
        cloudCoverPercentage: 6.89,
        sensingTime: '2020-04-30T10:09:22Z',
        unitsPerPixel: 10.0,
        area: 1.2055600804e10,
        hasLowQuantification: false,
        dos1: {
          B01: -1172,
          B02: -774,
          B03: -383,
          B04: -170,
          B05: -132,
          B06: -104,
          B07: -87,
          B08: -48,
          B09: 0,
          B10: 0,
          B11: 0,
          B12: 0,
          B8A: -45,
        },
        processingData: {
          availableData: {
            R10m: {
              bandCombinations: ['AOT', 'B02', 'B03', 'B04', 'B08', 'WVP'],
            },
            R20m: {
              bandCombinations: [
                'AOT',
                'B02',
                'B03',
                'B04',
                'B05',
                'B06',
                'B07',
                'B08',
                'B11',
                'B12',
                'B8A',
                'SCL',
                'WVP',
              ],
            },
            R60m: {
              bandCombinations: [
                'AOT',
                'B01',
                'B02',
                'B03',
                'B04',
                'B05',
                'B06',
                'B07',
                'B08',
                'B09',
                'B11',
                'B12',
                'B8A',
                'SCL',
                'WVP',
              ],
            },
          },
          url: 's3://sentinel-s2-l2a/tiles/32/T/QL/2020/4/30/0',
          jp2Format: 'N0209',
        },
        productId: 'S2B_MSIL2A_20200430T100019_N0214_R122_T32TQL_20200430T131222',
        copernicusHubProductId: '6159c4bc-2871-470b-a13f-c45da49c75a2',
        orbitId: 41129,
        l1cPath: 'tiles/32/T/QL/2020/4/30/0',
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
              [11.396715230122707, 41.52685304084347],
              [11.361121157317946, 40.53862626065115],
              [12.655543739210799, 40.504895198570296],
              [12.71056219697988, 41.49193502979004],
              [11.396715230122707, 41.52685304084347],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: { MGRSLocation: '32TQL', cloudCoverPercent: 6.89, tileId: 9299470 },
      links: [
        {
          target: 's3://sentinel-s2-l2a/tiles/32/T/QL/2020/4/30/0',
          type: LinkType.AWS,
        },
        {
          target: 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/32/T/QL/2020/4/30/0/preview.jpg',
          type: LinkType.PREVIEW,
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
  sensingTime = '2020-04-30T10:09:22Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new S2L2ACDASLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: maxCloudCoverPercent,
  });

  const expectedRequest: { [key: string]: any } = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-2-l2a'],
    limit: 5,
  };

  if (maxCloudCoverPercent !== null) {
    expectedRequest['filter'] = { op: '<=', args: [{ property: 'eo:cloud_cover' }, maxCloudCoverPercent] };
    expectedRequest['filter-lang'] = 'cql2-json';
  }

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'S2B_MSIL2A_20200430T100019_N0214_R122_T33TTF_20200430T131222',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [11.405887889418958, 41.49563781844384],
                [11.459188692945402, 40.508472177380604],
                [12.753801780580947, 40.540918766006406],
                [12.719936453887513, 41.52922626150487],
                [11.405887889418958, 41.49563781844384],
              ],
            ],
          ],
        },
        bbox: [11.405887889418958, 40.508472177380604, 12.753801780580947, 41.52922626150487],
        stac_extensions: ['eo', 'projection'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T10:09:22Z',
          'proj:epsg': 32633,
          instruments: ['msi'],
          constellation: 'sentinel-2',
          'proj:geometry': {
            crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32633' } },
            coordinates: [
              [
                [
                  [199980.99874031136, 4600019.0000769235],
                  [199980.9988798835, 4490221.000057325],
                  [309778.99995349767, 4490221.000053011],
                  [309778.99994773313, 4600019.00007056],
                  [199980.99874031136, 4600019.0000769235],
                ],
              ],
            ],
          },
          'eo:cloud_cover': 6.76,
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
            { name: 'B11', common_name: 'swir16', center_wavelength: 1.6137, full_width_half_max: 0.091 },
            { name: 'B12', common_name: 'swir22', center_wavelength: 2.2024, full_width_half_max: 0.175 },
          ],
          'eo:gsd': 10,
          'proj:bbox': [195463.8052275022, 4486618.982600282, 312604.49303663656, 4603748.868847981],
          platform: 'sentinel-2b',
        },
        links: [
          {
            href:
              'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-2-l2a/items/S2B_MSIL2A_20200430T100019_N0214_R122_T33TTF_20200430T131222',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-2-l2a',
            rel: 'parent',
          },
          {
            href:
              "https://scihub.copernicus.eu/dhus/odata/v1/Products('72a034ef-cb01-4081-821d-c493ac3fdb0b')/$value",
            rel: 'derived_from',
            title: 'scihub download',
          },
        ],
        assets: {
          data: {
            href: 's3://sentinel-s2-l2a/tiles/33/T/TF/2020/4/30/0/',
            title: 's3',
            type: 'inode/directory',
          },
        },
      },
    ],
    links: [
      {
        href: 'https://creodias.sentinel-hub.com/api/v1/catalog/search',
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
              [11.405887889418958, 41.49563781844384],
              [11.459188692945402, 40.508472177380604],
              [12.753801780580947, 40.540918766006406],
              [12.719936453887513, 41.52922626150487],
              [11.405887889418958, 41.49563781844384],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 6.76,
        MGRSLocation: '33TTF',
      },
      links: [
        {
          target: 's3://sentinel-s2-l2a/tiles/33/T/TF/2020/4/30/0/',
          type: LinkType.AWS,
        },
        {
          target:
            "https://scihub.copernicus.eu/dhus/odata/v1/Products('72a034ef-cb01-4081-821d-c493ac3fdb0b')/$value",
          type: LinkType.SCIHUB,
        },
        {
          target: 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/33/T/TF/2020/4/30/0/preview.jpg',
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
