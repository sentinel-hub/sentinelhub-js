import moment from 'moment';

import { LinkType, Landsat8AWSLayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T10:12:11.382Z',
  hasMore = true,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new Landsat8AWSLayer({
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
        type: 'L8',
        id: 2772179,
        originalId: 'LC08_L1GT_194033_20200430_20200430_01_RT',
        dataUri:
          'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/LC08_L1GT_194033_20200430_20200430_01_RT',
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
              [167700.0, 4428300.0],
              [403500.0, 4428300.0],
              [403500.0, 4188900.0],
              [167700.0, 4188900.0],
              [167700.0, 4428300.0],
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
                [5.7109842887919795, 39.95644578064385],
                [7.874160902782947, 39.55384061139758],
                [7.320511752401974, 37.837324852768496],
                [5.209153948559947, 38.23794189547658],
                [5.7110101707432115, 39.95590608087613],
                [5.7109842887919795, 39.95644578064385],
              ],
            ],
          ],
        },
        cloudCoverPercentage: 36.66,
        sensingTime: '2020-04-30T10:12:11.382Z',
        area: 3.740229045e10,
        sunElevation: 60.455486,
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
              [5.7109842887919795, 39.95644578064385],
              [7.874160902782947, 39.55384061139758],
              [7.320511752401974, 37.837324852768496],
              [5.209153948559947, 38.23794189547658],
              [5.7110101707432115, 39.95590608087613],
              [5.7109842887919795, 39.95644578064385],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 36.66,
        sunElevation: 60.455486,
      },
      links: [
        {
          target:
            'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/LC08_L1GT_194033_20200430_20200430_01_RT',
          type: LinkType.AWS,
        },
        {
          target:
            'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/LC08_L1GT_194033_20200430_20200430_01_RT_thumb_small.jpg',
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
  sensingTime = '2020-04-30T10:12:11Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 8 - 1, 23, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 8 - 1, 23, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new Landsat8AWSLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: maxCloudCoverPercent,
  });

  const expectedRequest = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['landsat-8-l1c'],
    limit: 5,
    query: { 'eo:cloud_cover': { lte: maxCloudCoverPercent } },
  };

  if (maxCloudCoverPercent === null) {
    delete expectedRequest['query']['eo:cloud_cover'];
  }

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'LC08_L1GT_194033_20200430_20200430_01_RT',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [5.7109842887919795, 39.95644578064385],
                [7.874160902782947, 39.55384061139758],
                [7.320511752401974, 37.837324852768496],
                [5.209153948559947, 38.23794189547658],
                [5.7110101707432115, 39.95590608087613],
                [5.7109842887919795, 39.95644578064385],
              ],
            ],
          ],
        },
        bbox: [5.209153948559947, 37.837324852768496, 7.874160902782947, 39.95644578064385],
        stac_extensions: ['eo', 'projection', 'view'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T10:12:11Z',
          'proj:epsg': 32632,
          'view:sun_elevation': 60.455486,
          instruments: ['oli', 'tirs'],
          'proj:geometry': {
            crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32632' } },
            coordinates: [
              [
                [
                  [219044.9993369055, 4428105.000044693],
                  [403274.99999962206, 4378845.000037575],
                  [352214.9999941201, 4189095.0000135093],
                  [168194.9982568749, 4239015.000025735],
                  [219044.99933694716, 4428045.000044682],
                  [219044.9993369055, 4428105.000044693],
                ],
              ],
            ],
          },
          'eo:bands': [
            { name: 'B01', common_name: 'coastal', center_wavelength: 0.44296, full_width_half_max: 0.01598 },
            { name: 'B02', common_name: 'blue', center_wavelength: 0.48204, full_width_half_max: 0.06004 },
            { name: 'B03', common_name: 'green', center_wavelength: 0.56141, full_width_half_max: 0.05733 },
            { name: 'B04', common_name: 'red', center_wavelength: 0.65459, full_width_half_max: 0.03747 },
            { name: 'B05', common_name: 'nir08', center_wavelength: 0.86467, full_width_half_max: 0.02825 },
            { name: 'B06', common_name: 'swir16', center_wavelength: 1.60886, full_width_half_max: 0.08472 },
            { name: 'B07', common_name: 'swir22', center_wavelength: 2.20073, full_width_half_max: 0.18666 },
            { name: 'B08', common_name: 'pan', center_wavelength: 0.5895, full_width_half_max: 0.1724 },
            { name: 'B09', common_name: 'cirrus', center_wavelength: 1.37343, full_width_half_max: 0.02039 },
            { name: 'B10', common_name: 'lwir11', center_wavelength: 10.895, full_width_half_max: 0.8 },
            { name: 'B11', common_name: 'lwir12', center_wavelength: 12.005, full_width_half_max: 1.0 },
            { name: 'BQA' },
          ],
          'eo:cloud_cover': 36.66,
          'eo:gsd': 15,
          'view:sun_azimuth': 138.61797274,
          'proj:bbox': [166379.24499772215, 4188363.2088456242, 403836.5859444837, 4429808.485074575],
          platform: 'landsat-8',
        },
        links: [
          {
            href:
              'https://services-uswest2.sentinel-hub.com/api/v1/catalog/collections/landsat-8-l1c/items/LC08_L1GT_194033_20200430_20200430_01_RT',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://services-uswest2.sentinel-hub.com/api/v1/catalog/collections/landsat-8-l1c',
            rel: 'parent',
          },
          {
            href: 'https://landsatonaws.com/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT',
            rel: 'data',
            title: 'landsatonaws',
          },
        ],
        assets: {
          data: {
            href:
              'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/index.html',
            title: 's3',
            type: 'text/html',
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
              [5.7109842887919795, 39.95644578064385],
              [7.874160902782947, 39.55384061139758],
              [7.320511752401974, 37.837324852768496],
              [5.209153948559947, 38.23794189547658],
              [5.7110101707432115, 39.95590608087613],
              [5.7109842887919795, 39.95644578064385],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 36.66,
        sunElevation: 60.455486,
      },
      links: [
        {
          target:
            'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/index.html',
          type: LinkType.AWS,
        },
        {
          target:
            'http://landsat-pds.s3.amazonaws.com/c1/L8/194/033/LC08_L1GT_194033_20200430_20200430_01_RT/LC08_L1GT_194033_20200430_20200430_01_RT_thumb_small.jpg',
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
