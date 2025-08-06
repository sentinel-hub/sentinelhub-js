import moment from 'moment';

import { LinkType, MODISLayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-04-30T12:00:00.000Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
}): Record<any, any> {
  const layer = new MODISLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
  });

  const expectedRequest = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['modis'],
    limit: 5,
  };

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'MCD43A4.006/18/08/2020121/MCD43A4.A2020121.h18v08.006.2020130042056',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [0.0, 0.0],
                [1111950.5197665244, 0.0],
                [1111950.5197665244, 1111950.5197665244],
                [0.0, 1111950.5197665244],
                [0.0, 0.0],
              ],
            ],
          ],
        },
        bbox: [0.0, 0.0, 1111950.5197665244, 1111950.5197665244],
        stac_extensions: ['eo'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T12:00:00Z',
          instruments: 'modis',
          'eo:bands': [
            { name: 'B01', common_name: 'red', center_wavelength: 0.645, full_width_half_max: 0.05 },
            { name: 'B02', common_name: 'nir', center_wavelength: 0.8585, full_width_half_max: 0.035 },
            { name: 'B03', common_name: 'blue', center_wavelength: 0.469, full_width_half_max: 0.02 },
            { name: 'B04', common_name: 'green', center_wavelength: 0.555, full_width_half_max: 0.02 },
            { name: 'B05', center_wavelength: 1.24, full_width_half_max: 0.02 },
            { name: 'B06', common_name: 'swir16', center_wavelength: 1.64, full_width_half_max: 0.024 },
            { name: 'B07', common_name: 'swir22', center_wavelength: 2.13, full_width_half_max: 0.05 },
          ],
          'eo:gsd': 250,
          platform: ['Terra', 'Aqua'],
        },
        links: [
          {
            href: 'https://services-uswest2.sentinel-hub.com/api/v1/catalog/collections/modis/items/MCD43A4.006/18/08/2020121/MCD43A4.A2020121.h18v08.006.2020130042056',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://services-uswest2.sentinel-hub.com/api/v1/catalog/collections/modis',
            rel: 'parent',
          },
        ],
        assets: {
          data: {
            href: 's3://astraea-opendata/MCD43A4.006/18/08/2020121',
            title: 's3',
            type: 'inode/directory',
          },
        },
      },
    ],
    links: [
      {
        href: 'https://services-uswest2.sentinel-hub.com/api/v1/catalog/search',
        rel: 'self',
        type: 'application/json',
      },
    ],
    context: { limit: 50, returned: 1 },
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
              [0.0, 0.0],
              [1111950.5197665244, 0.0],
              [1111950.5197665244, 1111950.5197665244],
              [0.0, 1111950.5197665244],
              [0.0, 0.0],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [
        {
          target: 's3://astraea-opendata/MCD43A4.006/18/08/2020121',
          type: LinkType.AWS,
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
