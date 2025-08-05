import moment from 'moment';

import { LinkType, S5PL2Layer, BBox, CRS_EPSG4326 } from '../../index';
import { ProductType } from '../S5PL2Layer';

export function constructFixtureFindTilesCatalog(
  layerClass: typeof S5PL2Layer,
  {
    sensingTime = '2020-04-30T12:03:00Z',
    hasMore = false,
    fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
    toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
    bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
    productType = ProductType.SO2,
  },
): Record<any, any> {
  const layer = new layerClass({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    productType: productType,
  });

  const expectedRequest: { [key: string]: any } = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: ['sentinel-5p-l2'],
    limit: 5,
  };

  if (productType) {
    expectedRequest['filter'] = { op: '=', args: [{ property: 's5p:type' }, productType] };
    expectedRequest['filter-lang'] = 'cql2-json';
  }

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      {
        stac_version: '0.9.0',
        id: 'S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627',
        geometry: {
          type: 'MultiPolygon',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC::CRS84' } },
          coordinates: [
            [
              [
                [-12.721891493930624, 31.812974516479414],
                [-8.906693181475719, 33.58886317355256],
                [-5.381863790518268, 35.003100865350845],
                [-2.23097730382435, 36.02543403757147],
                [0.9303435828424488, 36.79008172614628],
                [4.198133526448855, 37.31579948929272],
                [7.671073539078119, 37.61449418587917],
                [11.555288893311484, 37.70710019352643],
                [16.05630035614101, 37.59304891689946],
                [15.203996634173475, 47.31707911420838],
                [14.915909653030623, 55.55812738466515],
                [9.112003909667038, 55.88880269519543],
                [3.503214420983622, 55.897564989821134],
                [-1.5369788901108823, 55.579305141150755],
                [-6.239918604759402, 54.92934481268804],
                [-10.631503350015139, 53.95693456273338],
                [-14.907628745860078, 52.62163925488233],
                [-19.27727220041564, 50.84647956407001],
                [-23.688254344847962, 48.65035483162743],
                [-20.651714334879053, 45.038088018434706],
                [-17.779772922568373, 40.977963705760125],
                [-15.141878771437622, 36.56388106236154],
                [-12.721891493930624, 31.812974516479414],
              ],
            ],
          ],
        },
        bbox: [-180.0, -69.11183114132304, 180.0, 90.0],
        stac_extensions: ['eo'],
        type: 'Feature',
        properties: {
          datetime: '2020-04-30T12:03:00Z',
          orbit_id: 13196,
          instruments: ['tropomi'],
          timeliness: 'OFFL',
          'eo:bands': [{ name: 'SO2' }],
          'eo:gsd': 7000,
          type: 'SO2',
          platform: 'sentinel-5 precursor',
        },
        links: [
          {
            href: `${layer.dataset.shServiceHostname}/api/v1/catalog/collections/sentinel-5p-l2/items/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627`,
            rel: 'self',
            type: 'application/json',
          },
          {
            href: `${layer.dataset.shServiceHostname}/api/v1/catalog/collections/sentinel-5p-l2`,
            rel: 'parent',
          },
        ],
        assets: {
          data: {
            href: 's3://EODATA/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627.nc',
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
              [-12.721891493930624, 31.812974516479414],
              [-8.906693181475719, 33.58886317355256],
              [-5.381863790518268, 35.003100865350845],
              [-2.23097730382435, 36.02543403757147],
              [0.9303435828424488, 36.79008172614628],
              [4.198133526448855, 37.31579948929272],
              [7.671073539078119, 37.61449418587917],
              [11.555288893311484, 37.70710019352643],
              [16.05630035614101, 37.59304891689946],
              [15.203996634173475, 47.31707911420838],
              [14.915909653030623, 55.55812738466515],
              [9.112003909667038, 55.88880269519543],
              [3.503214420983622, 55.897564989821134],
              [-1.5369788901108823, 55.579305141150755],
              [-6.239918604759402, 54.92934481268804],
              [-10.631503350015139, 53.95693456273338],
              [-14.907628745860078, 52.62163925488233],
              [-19.27727220041564, 50.84647956407001],
              [-23.688254344847962, 48.65035483162743],
              [-20.651714334879053, 45.038088018434706],
              [-17.779772922568373, 40.977963705760125],
              [-15.141878771437622, 36.56388106236154],
              [-12.721891493930624, 31.812974516479414],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [
        {
          target:
            's3://EODATA/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627.nc',
          type: LinkType.AWS,
        },
        {
          target:
            '/eodata/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627.nc',
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
