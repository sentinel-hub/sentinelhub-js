import {
  AcquisitionMode,
  BBox,
  BYOCLayer,
  CRS_EPSG4326,
  OrbitDirection,
  Polarization,
  Resolution,
  S1GRDAWSEULayer,
  S3SLSTRLayer,
  S5PL2Layer,
} from '../../index';
import { AbstractSentinelHubV3Layer } from '../AbstractSentinelHubV3Layer';
import { AbstractSentinelHubV3WithCCLayer } from '../AbstractSentinelHubV3WithCCLayer';

export function constructFixtureFindDatesUTCSearchIndex(
  layer: AbstractSentinelHubV3Layer,
  {
    fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
    toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 999)),
    bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
    maxCloudCoverPercent = null as number,
    productType = null as string,
    collectionId = 'mockCollectionId',
    acquisitionMode = null as AcquisitionMode,
    polarization = null as Polarization.DV,
    resolution = null as Resolution.HIGH,
    orbitDirection = null as OrbitDirection.ASCENDING,
  },
): Record<any, any> {
  const expectedRequest: Record<string, any> = {
    queryArea: {
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
    maxCloudCoverage: maxCloudCoverPercent !== null ? maxCloudCoverPercent / 100 : 1,
    from: fromTime.toISOString(),
    to: toTime.toISOString(),
  };
  /*
datasetParameters: {
      acquisitionMode: acquisitionMode,
      orbitDirection: orbitDirection,
      polarization: polarization,
      resolution: resolution,
      type: 'S1GRD',
    },

*/
  if (layer instanceof S1GRDAWSEULayer) {
    expectedRequest.datasetParameters = { type: 'S1GRD' };
  }
  if (layer instanceof S1GRDAWSEULayer && acquisitionMode) {
    expectedRequest.datasetParameters['acquisitionMode'] = acquisitionMode;
  }

  if (layer instanceof S1GRDAWSEULayer && orbitDirection) {
    expectedRequest.datasetParameters['orbitDirection'] = orbitDirection;
  }

  if (layer instanceof S1GRDAWSEULayer && polarization) {
    expectedRequest.datasetParameters['polarization'] = polarization;
  }

  if (layer instanceof S1GRDAWSEULayer && resolution) {
    expectedRequest.datasetParameters['resolution'] = resolution;
  }

  if (layer instanceof S3SLSTRLayer) {
    expectedRequest.datasetParameters = {
      orbitDirection: 'DESCENDING',
      type: 'S3SLSTR',
      view: 'NADIR',
    };
  }

  if (layer instanceof S5PL2Layer) {
    if (productType) {
      expectedRequest.datasetParameters = {
        productType: productType,
        type: 'S5PL2',
      };
    } else {
      expectedRequest.datasetParameters = {
        type: 'S5PL2',
      };
    }
  }

  if (layer instanceof BYOCLayer && collectionId) {
    expectedRequest.datasetParameters = {
      collectionId: collectionId,
      type: 'BYOC',
    };
  }
  /*
  if (layer instanceof BYOCLayer && locationId) {
    expectedRequest.datasetParameters = {
      locationId: locationId,
    };
  }
*/
  if (
    !(layer instanceof AbstractSentinelHubV3WithCCLayer || layer instanceof S5PL2Layer) &&
    (maxCloudCoverPercent === null || maxCloudCoverPercent === undefined)
  ) {
    delete expectedRequest['maxCloudCoverage'];
  }

  const mockedResponse = [
    '2020-04-30',
    '2020-04-28',
    '2020-04-26',
    '2020-04-23',
    '2020-04-21',
    '2020-04-18',
    '2020-04-16',
    '2020-04-13',
    '2020-04-11',
    '2020-04-08',
    '2020-04-06',
    '2020-04-03',
    '2020-04-01',
  ];

  const expectedResult = [
    '2020-04-30',
    '2020-04-28',
    '2020-04-26',
    '2020-04-23',
    '2020-04-21',
    '2020-04-18',
    '2020-04-16',
    '2020-04-13',
    '2020-04-11',
    '2020-04-08',
    '2020-04-06',
    '2020-04-03',
    '2020-04-01',
  ].map(d => new Date(d));
  return {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    layer: layer,
    mockedResponse: mockedResponse,
    expectedRequest: expectedRequest,
    expectedResult: expectedResult,
  };
}

export function constructFixtureFindDatesUTCCatalog(
  layer: AbstractSentinelHubV3Layer,
  {
    fromTime = new Date(Date.UTC(2020, 4 - 1, 1, 0, 0, 0, 0)),
    toTime = new Date(Date.UTC(2020, 5 - 1, 1, 23, 59, 59, 0)),
    bbox = new BBox(CRS_EPSG4326, 19, 20, 20, 21),
    maxCloudCoverPercent = null as number,
    productType = null as string,
    collectionId = 'mockCollectionId',
    acquisitionMode = AcquisitionMode.IW,
    polarization = Polarization.DV,
    resolution = Resolution.HIGH,
    orbitDirection = OrbitDirection.ASCENDING,
  },
): Record<any, any> {
  const expectedRequest: Record<string, any> = {
    bbox: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    datetime: `${fromTime.toISOString()}/${toTime.toISOString()}`,
    collections: [layer.dataset.catalogCollectionId],
    limit: 10000,
    distinct: 'date',
    query: { 'eo:cloud_cover': { lte: maxCloudCoverPercent !== null ? maxCloudCoverPercent : 100 } },
  };

  if (layer instanceof S1GRDAWSEULayer && acquisitionMode) {
    expectedRequest['query']['sar:instrument_mode'] = { eq: acquisitionMode };
  }

  if (layer instanceof S1GRDAWSEULayer && orbitDirection) {
    expectedRequest['query']['sat:orbit_state'] = { eq: orbitDirection };
  }

  if (layer instanceof S1GRDAWSEULayer && polarization) {
    expectedRequest['query']['polarization'] = { eq: polarization };
  }

  if (layer instanceof S1GRDAWSEULayer && resolution) {
    expectedRequest['query']['resolution'] = { eq: resolution };
  }

  if (layer instanceof S5PL2Layer && productType) {
    expectedRequest['query'] = { type: { eq: productType } };
  }

  if (layer instanceof BYOCLayer && collectionId) {
    expectedRequest['collections'] = [collectionId];
  }

  if (
    !(layer instanceof AbstractSentinelHubV3WithCCLayer) &&
    (maxCloudCoverPercent === null || maxCloudCoverPercent === undefined)
  ) {
    delete expectedRequest['query']['eo:cloud_cover'];
  }

  /* eslint-disable */
  const mockedResponse = {
    type: 'FeatureCollection',
    features: [
      '2020-04-30',
      '2020-04-28',
      '2020-04-26',
      '2020-04-23',
      '2020-04-21',
      '2020-04-18',
      '2020-04-16',
      '2020-04-13',
      '2020-04-11',
      '2020-04-08',
      '2020-04-06',
      '2020-04-03',
      '2020-04-01',
    ],
    links: [
      {
        href: 'https://services.sentinel-hub.com/api/v1/catalog/search',
        rel: 'self',
        type: 'application/json',
      },
    ],
    context: { limit: 10000, returned: 13 },
  };
  /* eslint-enable */

  const expectedResult = [
    '2020-04-30',
    '2020-04-28',
    '2020-04-26',
    '2020-04-23',
    '2020-04-21',
    '2020-04-18',
    '2020-04-16',
    '2020-04-13',
    '2020-04-11',
    '2020-04-08',
    '2020-04-06',
    '2020-04-03',
    '2020-04-01',
  ].map(d => new Date(d));

  return {
    fromTime: fromTime,
    toTime: toTime,
    bbox: bbox,
    layer: layer,
    mockedResponse: mockedResponse,
    expectedRequest: expectedRequest,
    expectedResult: expectedResult,
  };
}
