import moment from 'moment';

import { LinkType, S3SLSTRLayer, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T09:58:12Z',
  hasMore = true,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new S3SLSTRLayer({
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
        type: 'S3',
        id: 1248462,
        originalId:
          'EODATA/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
        dataUri:
          'http://data.cloudferro.com/EODATA/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
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
                [-2.097644, 52.417860999999995],
                [-2.172493, 51.979997999999995],
                [-2.183793, 51.978117],
                [-2.561625, 49.603713],
                [-2.572228, 49.601855],
                [-3.073191, 46.495608],
                [-3.0831899999999997, 46.493795999999996],
                [-3.504053, 43.885569],
                [-3.513627, 43.883797],
                [-3.607164, 43.27735],
                [-3.6074219999999997, 43.154911999999996],
                [-3.6361869999999996, 43.053247999999996],
                [-3.817099, 41.927941],
                [-1.938081, 41.73704],
                [-0.057815, 41.51406],
                [1.7088379999999999, 41.275048],
                [3.7856549999999998, 40.961298],
                [5.530151, 40.664483],
                [7.28933, 40.330644],
                [9.088379, 39.959548999999996],
                [10.778061, 39.583197],
                [11.383687, 41.110478],
                [12.133628999999999, 42.931393],
                [12.531452, 43.846731999999996],
                [13.640557999999999, 46.288629],
                [14.369261999999999, 47.770258],
                [15.192131, 49.350468],
                [15.507169, 49.926114999999996],
                [13.496939999999999, 50.363264],
                [11.372238, 50.781327999999995],
                [9.271621999999999, 51.15164],
                [7.152584999999999, 51.476853],
                [4.709772, 51.797017],
                [2.512508, 52.042319],
                [0.224742, 52.251915999999994],
                [-2.097644, 52.417860999999995],
              ],
            ],
          ],
        },
        sensingTime: '2020-04-30T09:58:12Z',
        productName:
          'S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
        cycle: 57,
        relativeOrbit: 350,
        frame: 2160,
        timeliness: 'NR',
        additionalData: {
          pixelEnvelope: {
            type: 'Polygon',
            coordinates: [
              [
                [145.0, 0.0],
                [145.0, 4090.0],
                [4821.0, 4090.0],
                [4821.0, 0.0],
                [145.0, 0.0],
              ],
            ],
          },
          errorEstimates: [10.12398400734969, 1.543008548245325, 0.606379343100804, 0.3931914366197954],
          xCoefficients: [
            4596.2055587768555,
            430.72991293668747,
            -74.63191604614258,
            -0.623042234336026,
            -1.3956050127744675,
            -0.42653124034404755,
            -0.006992724314841325,
            0.007913307377748424,
            -0.039211956842336804,
            0.008093118842225522,
          ],
          yCoefficients: [
            19320.13011932373,
            -95.66507685184479,
            -358.415894985199,
            -1.6208207387244329,
            0.7785560581833124,
            -0.17121314257383347,
            -0.0013507152152669732,
            0.0025232208136003464,
            0.009004542836919427,
            -8.248505182564259e-4,
          ],
        },
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
              [-2.097644, 52.417860999999995],
              [-2.172493, 51.979997999999995],
              [-2.183793, 51.978117],
              [-2.561625, 49.603713],
              [-2.572228, 49.601855],
              [-3.073191, 46.495608],
              [-3.0831899999999997, 46.493795999999996],
              [-3.504053, 43.885569],
              [-3.513627, 43.883797],
              [-3.607164, 43.27735],
              [-3.6074219999999997, 43.154911999999996],
              [-3.6361869999999996, 43.053247999999996],
              [-3.817099, 41.927941],
              [-1.938081, 41.73704],
              [-0.057815, 41.51406],
              [1.7088379999999999, 41.275048],
              [3.7856549999999998, 40.961298],
              [5.530151, 40.664483],
              [7.28933, 40.330644],
              [9.088379, 39.959548999999996],
              [10.778061, 39.583197],
              [11.383687, 41.110478],
              [12.133628999999999, 42.931393],
              [12.531452, 43.846731999999996],
              [13.640557999999999, 46.288629],
              [14.369261999999999, 47.770258],
              [15.192131, 49.350468],
              [15.507169, 49.926114999999996],
              [13.496939999999999, 50.363264],
              [11.372238, 50.781327999999995],
              [9.271621999999999, 51.15164],
              [7.152584999999999, 51.476853],
              [4.709772, 51.797017],
              [2.512508, 52.042319],
              [0.224742, 52.251915999999994],
              [-2.097644, 52.417860999999995],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [
        {
          target:
            '/eodata/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
          type: LinkType.CREODIAS,
        },
        {
          target:
            'https://finder.creodias.eu/files/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002-ql.jpg',
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
  sensingTime = '2020-04-30T21:18:06.506Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  maxCloudCoverPercent = 20,
}): Record<any, any> {
  const layer = new S3SLSTRLayer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    maxCloudCoverPercent: maxCloudCoverPercent,
  });

  const expectedRequest = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-3-slstr'],
    limit: 5,
    query: { 'eo:cloud_cover': { lte: maxCloudCoverPercent } },
  };

  if (maxCloudCoverPercent === null) {
    delete expectedRequest['query'];
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
            href:
              'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-3-slstr/items/S3A_SL_1_RBT____20200430T211807_20200430T212107_20200430T233757_0179_057_357_0540_LN2_O_NR_004.SEN3',
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
