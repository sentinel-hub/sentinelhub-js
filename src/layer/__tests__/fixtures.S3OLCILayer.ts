import { AbstractSentinelHubV3Layer } from './../AbstractSentinelHubV3Layer';
import moment from 'moment';

import { LinkType, BBox, CRS_EPSG4326 } from '../../index';

export function constructFixtureFindTilesCatalog(
  layerClass: typeof AbstractSentinelHubV3Layer,
  {
    sensingTime = '2020-04-30T09:58:12Z',
    hasMore = false,
    fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
    toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
    bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  },
): Record<any, any> {
  const layer = new layerClass({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
  });
  const expectedRequest = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-3-olci'],
    limit: 5,
  };

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
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
        bbox: [-3.817099, 39.583197, 15.507169, 52.417860999999995],
        stac_extensions: ['eo'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T09:58:12Z',
          instruments: ['olci'],
          'eo:bands': [
            { name: 'B01', center_wavelength: 0.4, full_width_half_max: 0.015 },
            { name: 'B02', center_wavelength: 0.4125, full_width_half_max: 0.01 },
            { name: 'B03', center_wavelength: 0.4425, full_width_half_max: 0.01 },
            { name: 'B04', center_wavelength: 0.49, full_width_half_max: 0.01 },
            { name: 'B05', center_wavelength: 0.51, full_width_half_max: 0.01 },
            { name: 'B06', center_wavelength: 0.56, full_width_half_max: 0.01 },
            { name: 'B07', center_wavelength: 0.62, full_width_half_max: 0.01 },
            { name: 'B08', center_wavelength: 0.665, full_width_half_max: 0.01 },
            { name: 'B09', center_wavelength: 0.67375, full_width_half_max: 0.0075 },
            { name: 'B10', center_wavelength: 0.68125, full_width_half_max: 0.0075 },
            { name: 'B11', center_wavelength: 0.70875, full_width_half_max: 0.01 },
            { name: 'B12', center_wavelength: 0.75375, full_width_half_max: 0.0075 },
            { name: 'B13', center_wavelength: 0.76125, full_width_half_max: 0.0025 },
            { name: 'B14', center_wavelength: 0.764375, full_width_half_max: 0.00375 },
            { name: 'B15', center_wavelength: 0.7675, full_width_half_max: 0.0025 },
            { name: 'B16', center_wavelength: 0.77875, full_width_half_max: 0.015 },
            { name: 'B17', center_wavelength: 0.865, full_width_half_max: 0.02 },
            { name: 'B18', center_wavelength: 0.885, full_width_half_max: 0.01 },
            { name: 'B19', center_wavelength: 0.9, full_width_half_max: 0.01 },
            { name: 'B20', center_wavelength: 0.94, full_width_half_max: 0.02 },
            { name: 'B21', center_wavelength: 1.02, full_width_half_max: 0.04 },
          ],
          'eo:gsd': 300,
          platform: 'sentinel-3',
        },
        links: [
          {
            href: `${layer.dataset.shServiceHostname}api/v1/catalog/collections/sentinel-3-olci/items/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3`,
            rel: 'self',
            type: 'application/json',
          },
          {
            href: `${layer.dataset.shServiceHostname}/api/v1/catalog/collections/sentinel-3-olci`,
            rel: 'parent',
          },
        ],
        assets: {
          thumbnail: {
            href: 'https://finder.creodias.eu/files/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002-ql.jpg',
            title: 'thumbnail',
            type: 'image/jpeg',
          },
          data: {
            href: 's3://DIAS/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
            title: 's3',
            type: 'inode/directory',
          },
        },
      },
    ],
    links: [
      {
        href: `${layer.dataset.shServiceHostname}/api/v1/catalog/search`,
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
            's3://DIAS/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
          type: LinkType.AWS,
        },
        {
          target:
            'https://finder.creodias.eu/files/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002-ql.jpg',
          type: 'preview',
        },
        {
          target:
            '/dias/Sentinel-3/OLCI/OL_1_EFR/2020/04/30/S3A_OL_1_EFR____20200430T095812_20200430T100112_20200430T114934_0180_057_350_2160_LN1_O_NR_002.SEN3',
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
