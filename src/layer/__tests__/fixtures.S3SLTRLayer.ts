import { AbstractSentinelHubV3WithCCLayer } from './../AbstractSentinelHubV3WithCCLayer';
import moment from 'moment';

import { LinkType, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesCatalog(
  layerClass: typeof AbstractSentinelHubV3WithCCLayer,
  {
    sensingTime = '2020-04-30T21:18:06.506Z',
    hasMore = false,
    fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
    toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
    bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
    maxCloudCoverPercent = 20,
  },
): Record<any, any> {
  const layer = new layerClass({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: maxCloudCoverPercent,
  });
  const expectedRequest: { [key: string]: any } = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-3-slstr'],
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
        id: 'S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [9.32494153664583, 32.624475086568644],
                [6.654804828247899, 43.20577321620681],
                [1.861630010932935, 42.39342618567595],
                [-2.8596030824902385, 41.37181713832621],
                [-0.9047323802222021, 36.42343930213505],
                [0.9986543449485602, 30.920471665151126],
                [5.147450278186556, 31.84516963303784],
                [9.32494153664583, 32.624475086568644],
              ],
            ],
          ],
        },
        bbox: [-2.8596030824902385, 30.920471665151126, 9.32494153664583, 43.20577321620681],
        stac_extensions: ['eo', 'sat'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T21:18:06.506Z',
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
          'eo:cloud_cover': 22.062482833862305,
          'eo:gsd': 1000,
          platform: 'sentinel-3',
        },
        links: [
          {
            href: `${layer.dataset.shServiceHostname}/api/v1/catalog/collections/sentinel-3-slstr/items/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3`,
            rel: 'self',
            type: 'application/json',
          },
          {
            href: `${layer.dataset.shServiceHostname}/api/v1/catalog/collections/sentinel-3-slstr`,
            rel: 'parent',
          },
        ],
        assets: {
          thumbnail: {
            href: 'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004-ql.jpg',
            title: 'thumbnail',
            type: 'image/jpeg',
          },
          data: {
            href: 's3://EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
            title: 's3',
            type: 'inode/directory',
          },
        },
      },
    ],
    links: [
      {
        href: `${layer.dataset.shServiceHostname}api/v1/catalog/search`,
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
              [9.32494153664583, 32.624475086568644],
              [6.654804828247899, 43.20577321620681],
              [1.861630010932935, 42.39342618567595],
              [-2.8596030824902385, 41.37181713832621],
              [-0.9047323802222021, 36.42343930213505],
              [0.9986543449485602, 30.920471665151126],
              [5.147450278186556, 31.84516963303784],
              [9.32494153664583, 32.624475086568644],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 22.062482833862305,
        orbitDirection: 'ascending',
      },
      links: [
        {
          target:
            's3://EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
          type: LinkType.AWS,
        },
        {
          target:
            'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004-ql.jpg',
          type: 'preview',
        },
        {
          target:
            '/eodata/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
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
