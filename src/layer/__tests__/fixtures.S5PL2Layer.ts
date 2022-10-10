import moment from 'moment';

import { LinkType, S5PL2Layer, BBox, CRS_EPSG4326 } from '../../index';
import { ProductType } from '../S5PL2Layer';

export function constructFixtureFindTilesSearchIndex({
  sensingTime = '2020-04-30T12:59:48Z',
  hasMore = true,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  productType = ProductType.SO2,
}): Record<any, any> {
  const layer = new S5PL2Layer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    productType: productType,
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
    maxCloudCoverage: 1,
    timeFrom: fromTime.toISOString(),
    timeTo: toTime.toISOString(),
    offset: 0,
    datasetParameters: { type: 'S5PL2', productType: productType },
  };

  const mockedResponse = {
    tiles: [
      {
        type: 'S5P',
        id: 4776187,
        originalId:
          'EODATA/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425.nc',
        dataUri:
          'http://data.cloudferro.com/EODATA/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425.nc',
        sensingTime: '2020-04-30T12:59:48Z',
        productName: 'S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425.nc',
        tileDrawRegionGeometry: {
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
                [-12.876374192400508, 32.138784748245996],
                [-9.050998815287903, 33.92122264449279],
                [-5.5759570140793615, 35.31781658143877],
                [-2.3514207072764193, 36.36568597148261],
                [0.8233509202245249, 37.13241728752964],
                [4.105998947252946, 37.65916973772451],
                [7.5952806048754, 37.957712805035015],
                [11.49789946309938, 38.0486375934873],
                [16.019676363525456, 37.930654414117136],
                [15.213178714221847, 47.17286426154503],
                [14.91690018023924, 55.12711145454758],
                [9.008341253486973, 55.45662932464365],
                [3.630199287989029, 55.458880993156015],
                [-1.3542448962729945, 55.142769050138284],
                [-6.00826126987976, 54.49785799948327],
                [-10.358929485901971, 53.532801978865116],
                [-14.601394105378953, 52.2070885120343],
                [-18.944144346210685, 50.44416074073832],
                [-23.33600548578315, 48.262909246838596],
                [-20.448516504344223, 44.77324353095672],
                [-17.77978488965107, 40.97798792495399],
                [-15.24324507465063, 36.7474414180249],
                [-12.876374192400508, 32.138784748245996],
              ],
            ],
          ],
        },
        timeliness: 'NRTI',
        productType: productType,
        additionalData: {
          pixelEnvelope: {
            type: 'Polygon',
            coordinates: [
              [
                [0.0, 0.0],
                [0.0, 357.0],
                [450.0, 357.0],
                [450.0, 0.0],
                [0.0, 0.0],
              ],
            ],
          },
          latCoefficients: [
            -128.7241382598877,
            -6.670354038476944,
            14.10818612575531,
            2.272536104544997,
            1.995137795805931,
            -0.25244469568133354,
            -0.06694354171554551,
            -0.0860297123726923,
            -0.042259250330971554,
            0.004244219802785665,
            -9.098381532357536e-5,
            9.618848745063246e-4,
            7.369346951122679e-4,
            2.3342767030953837e-4,
            -2.9172913855290972e-5,
          ],
          lonCoefficients: [
            -666.6268177032471,
            -6.694219172000885,
            16.76114547252655,
            0.07781993190292269,
            -0.07211521919816732,
            0.04499359801411629,
            0.004179233268814642,
            0.007114302828995278,
            0.005323755729477853,
            -3.749761963263154e-4,
            -6.959126637262614e-5,
            -9.75983120490298e-5,
            -1.0776068401696648e-4,
            -4.205959567116224e-5,
            2.518156861697207e-6,
          ],
          errorEstimates: [20.664674256106764, 1.4269664134399136, 4.231102505172432, 0.13135785058428665],
        },
        orbitId: 13196,
        sensingEnd: '2020-04-30T13:04:48Z',
        processorVersion: 10108,
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
              [-12.876374192400508, 32.138784748245996],
              [-9.050998815287903, 33.92122264449279],
              [-5.5759570140793615, 35.31781658143877],
              [-2.3514207072764193, 36.36568597148261],
              [0.8233509202245249, 37.13241728752964],
              [4.105998947252946, 37.65916973772451],
              [7.5952806048754, 37.957712805035015],
              [11.49789946309938, 38.0486375934873],
              [16.019676363525456, 37.930654414117136],
              [15.213178714221847, 47.17286426154503],
              [14.91690018023924, 55.12711145454758],
              [9.008341253486973, 55.45662932464365],
              [3.630199287989029, 55.458880993156015],
              [-1.3542448962729945, 55.142769050138284],
              [-6.00826126987976, 54.49785799948327],
              [-10.358929485901971, 53.532801978865116],
              [-14.601394105378953, 52.2070885120343],
              [-18.944144346210685, 50.44416074073832],
              [-23.33600548578315, 48.262909246838596],
              [-20.448516504344223, 44.77324353095672],
              [-17.77978488965107, 40.97798792495399],
              [-15.24324507465063, 36.7474414180249],
              [-12.876374192400508, 32.138784748245996],
            ],
          ],
        ],
      },
      sensingTime: moment.utc(sensingTime).toDate(),
      meta: {},
      links: [
        {
          target:
            '/eodata/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425/S5P_NRTI_L2__SO2____20200430T125948_20200430T130448_13196_01_010108_20200430T134425.nc',
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

export function constructFixtureFindTilesCatalog({
  sensingTime = '2020-04-30T12:03:00Z',
  hasMore = false,
  fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
  toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
  bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
  productType = ProductType.SO2,
}): Record<any, any> {
  const layer = new S5PL2Layer({
    instanceId: 'INSTANCE_ID',
    layerId: 'LAYER_ID',
    productType: productType,
  });

  const expectedRequest: any = {
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
            href:
              'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-5p-l2/items/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627',
            rel: 'self',
            type: 'application/json',
          },
          {
            href: 'https://creodias.sentinel-hub.com/api/v1/catalog/collections/sentinel-5p-l2',
            rel: 'parent',
          },
        ],
        assets: {
          data: {
            href:
              's3://EODATA/Sentinel-5P/TROPOMI/L2__SO2___/2020/04/30/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627/S5P_OFFL_L2__SO2____20200430T120356_20200430T134526_13196_01_010108_20200502T144627.nc',
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
