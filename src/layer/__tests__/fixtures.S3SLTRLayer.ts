import { AbstractSentinelHubV3WithCCLayer } from './../AbstractSentinelHubV3WithCCLayer';
import moment from 'moment';

import { LinkType, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesSearchIndex(
  layerClass: typeof AbstractSentinelHubV3WithCCLayer,
  {
    sensingTime = '2020-04-30T09:58:11.882Z',
    hasMore = true,
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
    datasetParameters: {
      orbitDirection: 'DESCENDING',
      type: 'S3SLSTR',
      view: 'NADIR',
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
        type: 'S3SLSTR',
        id: 1921861,
        originalId:
          'EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004.SEN3',
        dataUri:
          'http://data.cloudferro.com/EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004.SEN3',
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
                [-2.468773967874798, 52.46678839557069],
                [-4.1413650701609726, 41.9345339746374],
                [0.059320398363811325, 41.476215786822635],
                [4.362892567760172, 40.838592561744825],
                [8.39370764618624, 40.08134499195091],
                [12.536144992401084, 39.135714708889715],
                [14.988578839454325, 44.60573941226634],
                [16.248574468491988, 47.064395459565326],
                [17.592085799369745, 49.45365353239512],
                [12.698508289476116, 50.55155487771758],
                [7.868328680774166, 51.39458645753124],
                [2.65032535072137, 52.05548315635147],
                [-2.468773967874798, 52.46678839557069],
              ],
            ],
          ],
        },
        cloudCoverPercentage: 70.80023956298828,
        sensingTime: '2020-04-30T09:58:11.882Z',
        productName:
          'S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004.SEN3',
        obliqueDataGeometry: {
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
                [5.597816666651402, 51.7136045420516],
                [4.032431232042233, 46.733169493587944],
                [2.4754737665950723, 41.14477319059084],
                [7.12255172282423, 40.34188599414061],
                [11.725934173318402, 39.339246555720706],
                [14.111334729011466, 44.82103189709212],
                [15.336136976006143, 47.288448224561805],
                [16.641395282132677, 49.687417491757934],
                [11.18078257981423, 50.841386540037426],
                [5.597816666651402, 51.7136045420516],
              ],
            ],
          ],
        },
        cycle: 57,
        relativeOrbit: 350,
        frame: 2160,
        timeliness: 'NR',
        additionalData: {
          pixelEnvelope: {
            type: 'Polygon',
            coordinates: [
              [
                [78.0, 0.0],
                [78.0, 2400.0],
                [2959.0, 2400.0],
                [2959.0, 0.0],
                [78.0, 0.0],
              ],
            ],
          },
          errorEstimates: [0.13876327902880803, 0.6201986401138129, 0.02667770719220408, 0.09159002148806844],
          pixelEnvelopeOblique: {
            type: 'Polygon',
            coordinates: [
              [
                [100.0, 0.0],
                [100.0, 2399.0],
                [1716.0, 2399.0],
                [1716.0, 0.0],
                [100.0, 0.0],
              ],
            ],
          },
          offsets: {
            tiePoint: {
              start: 14458,
              track: 64,
            },
            nadir1km: {
              start: 14458,
              track: 998,
            },
            oblique1km: {
              start: 14458,
              track: 450,
            },
            nadir500m: {
              start: 28916,
              track: 1996,
            },
            oblique500m: {
              start: 28916,
              track: 900,
            },
            nadirF1: {
              start: 14458,
              track: 998,
            },
            obliqueF1: {
              start: 14458,
              track: 450,
            },
          },
          solarIrradiance: [
            1810.5114211358484,
            1498.1347247211947,
            942.9690427820371,
            360.4406990393776,
            241.74631419529769,
            76.30583273560039,
          ],
          xCoefficients: [
            2641.2015953063965,
            226.60192400217056,
            -46.84138464927673,
            -0.2546079733874649,
            -0.5248879659920931,
            -0.10691561549901962,
            -0.0038675773961358573,
            0.002465897716319887,
            -0.023322941473452374,
            0.0035957663785666227,
          ],
          yCoefficients: [
            11427.666122436523,
            -54.66822412610054,
            -216.39408373832703,
            -0.9036153573542833,
            0.38148084841668606,
            0.03461052104830742,
            6.809589317526843e-4,
            1.050975697580725e-7,
            0.006229528837138787,
            -0.001475233817473054,
          ],
        },
        orbitDirection: 'DESCENDING',
      },
    ],
    hasMore: hasMore,
    maxOrderKey: '2020-04-30T09:18:38.148Z;1924015,48.99588394165039',
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
              [-2.468773967874798, 52.46678839557069],
              [-4.1413650701609726, 41.9345339746374],
              [0.059320398363811325, 41.476215786822635],
              [4.362892567760172, 40.838592561744825],
              [8.39370764618624, 40.08134499195091],
              [12.536144992401084, 39.135714708889715],
              [14.988578839454325, 44.60573941226634],
              [16.248574468491988, 47.064395459565326],
              [17.592085799369745, 49.45365353239512],
              [12.698508289476116, 50.55155487771758],
              [7.868328680774166, 51.39458645753124],
              [2.65032535072137, 52.05548315635147],
              [-2.468773967874798, 52.46678839557069],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {
        cloudCoverPercent: 70.80023956298828,
        orbitDirection: 'DESCENDING',
      },
      links: [
        {
          target:
            '/eodata/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004.SEN3',

          type: LinkType.CREODIAS,
        },
        {
          target:
            'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200430T095812_20200430T100112_20200430T115741_0180_057_350_2160_LN2_O_NR_004-ql.jpg',
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
        id:
          'S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
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
            href:
              'https://finder.creodias.eu/files/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004-ql.jpg',
            title: 'thumbnail',
            type: 'image/jpeg',
          },
          data: {
            href:
              's3://EODATA/Sentinel-3/SLSTR/SL_1_RBT/2020/04/30/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
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
