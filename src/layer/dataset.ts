export type Dataset = {
  id: string;
  shJsonGetCapabilitiesDataset: string | null;
  shWmsEvalsource: string;
  shProcessingApiDatasourceAbbreviation: string;
  datasetParametersType: string | null;
  shServiceHostname: string;
  searchIndexUrl: string;
  findDatesUTCUrl: string;
  orbitTimeMinutes: number;
  minDate: Date | null;
  maxDate: Date | null;
  catalogCollectionId?: string | null;
};

export const DATASET_AWSEU_S1GRD: Dataset = {
  id: 'AWSEU_S1GRD',
  shJsonGetCapabilitiesDataset: 'S1GRD',
  shWmsEvalsource: 'S1GRD',
  shProcessingApiDatasourceAbbreviation: 'S1GRD',
  datasetParametersType: 'S1GRD',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex',
  findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/findAvailableData',
  orbitTimeMinutes: 49.3,
  minDate: new Date(Date.UTC(2014, 10 - 1, 3, 0, 47, 14)), // 2014-10-03T00:47:14Z
  maxDate: null,
  catalogCollectionId: 'sentinel-1-grd',
};

export const DATASET_EOCLOUD_S1GRD: Dataset = {
  id: 'EOC_S1GRD_IW',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: null, // it's complicated - allowed values are 'S1' (for IW) and 'S1_EW'
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: 'S1GRD',
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/s1/v1/search',
  findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/s1/v1/finddates',
  orbitTimeMinutes: 49.3,
  minDate: new Date(Date.UTC(2014, 10 - 1, 3, 0, 37, 40)), // 2014-10-03T00:37:40Z
  maxDate: null,
};

export const DATASET_CDAS_S1GRD: Dataset = {
  id: 'CDAS_S1GRD',
  shJsonGetCapabilitiesDataset: 'S1GRD',
  shWmsEvalsource: 'S1GRD',
  shProcessingApiDatasourceAbbreviation: 'S1GRD',
  datasetParametersType: 'S1GRD',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex',
  findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S1GRD/findAvailableData',
  orbitTimeMinutes: 49.3,
  minDate: new Date(Date.UTC(2022, 11 - 1, 1, 0, 0, 0)), // 2022-11-01T00:00:00Z
  maxDate: null,
};

export const DATASET_S2L2A: Dataset = {
  id: 'AWS_S2L2A',
  shJsonGetCapabilitiesDataset: 'S2L2A',
  shWmsEvalsource: 'S2L2A',
  shProcessingApiDatasourceAbbreviation: 'S2L2A',
  datasetParametersType: 'S2',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
  findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/findAvailableData',
  orbitTimeMinutes: 50.3,
  minDate: new Date(Date.UTC(2016, 10 - 1, 20, 8, 9, 58)), // 2016-10-20T08:09:58Z
  maxDate: null,
  catalogCollectionId: 'sentinel-2-l2a',
};

export const DATASET_S2L1C: Dataset = {
  id: 'AWS_S2L1C',
  shJsonGetCapabilitiesDataset: 'S2L1C',
  shWmsEvalsource: 'S2',
  shProcessingApiDatasourceAbbreviation: 'S2L1C',
  datasetParametersType: 'S2',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
  findDatesUTCUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/findAvailableData',
  orbitTimeMinutes: 50.3,
  minDate: new Date(Date.UTC(2015, 6 - 1, 27, 10, 25, 31)), // 2015-06-27T10:25:31
  maxDate: null,
  catalogCollectionId: 'sentinel-2-l1c',
};

export const DATASET_CDAS_S2L2A: Dataset = {
  id: 'CDAS_S2L2A',
  shJsonGetCapabilitiesDataset: 'S2L2A',
  shWmsEvalsource: 'S2L2A',
  shProcessingApiDatasourceAbbreviation: 'S2L2A',
  datasetParametersType: 'S2',
  shServiceHostname: 'https://services.cdasstage.sentinel-hub.com/',
  searchIndexUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
  findDatesUTCUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L2A/findAvailableData',
  orbitTimeMinutes: 50.3,
  minDate: new Date(Date.UTC(2016, 10 - 1, 20, 8, 9, 58)), // 2016-10-20T08:09:58Z
  maxDate: null,
  catalogCollectionId: 'sentinel-2-l2a',
};

export const DATASET_CDAS_S2L1C: Dataset = {
  id: 'CDAS_S2L1C',
  shJsonGetCapabilitiesDataset: 'S2L1C',
  shWmsEvalsource: 'S2',
  shProcessingApiDatasourceAbbreviation: 'S2L1C',
  datasetParametersType: 'S2',
  shServiceHostname: 'https://services.cdasstage.sentinel-hub.com/',
  searchIndexUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
  findDatesUTCUrl: 'https://services.cdasstage.sentinel-hub.com/index/v3/collections/S2L1C/findAvailableData',
  orbitTimeMinutes: 50.3,
  minDate: new Date(Date.UTC(2015, 6 - 1, 27, 10, 25, 31)), // 2015-06-27T10:25:31
  maxDate: null,
  catalogCollectionId: 'sentinel-2-l1c',
};
export const DATASET_S3SLSTR: Dataset = {
  id: 'CRE_S3SLSTR',
  shJsonGetCapabilitiesDataset: 'S3SLSTR',
  shWmsEvalsource: 'S3SLSTR',
  shProcessingApiDatasourceAbbreviation: 'S3SLSTR',
  datasetParametersType: 'S3SLSTR',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3SLSTR/searchIndex',
  findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3SLSTR/findAvailableData',
  orbitTimeMinutes: 50.495,
  minDate: new Date(Date.UTC(2016, 4 - 1, 19, 0, 46, 32)), // 2016-04-19T00:46:32.578
  maxDate: null,
  catalogCollectionId: 'sentinel-3-slstr',
};

export const DATASET_S3OLCI: Dataset = {
  id: 'CRE_S3OLCI',
  shJsonGetCapabilitiesDataset: 'S3OLCI',
  shWmsEvalsource: 'S3OLCI',
  shProcessingApiDatasourceAbbreviation: 'S3OLCI',
  datasetParametersType: 'S3',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
  findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/findAvailableData',
  orbitTimeMinutes: 50.495,
  minDate: new Date(Date.UTC(2016, 4 - 1, 25, 11, 33, 14)), // 2016-04-25T11:33:14
  maxDate: null,
  catalogCollectionId: 'sentinel-3-olci',
};

export const DATASET_S5PL2: Dataset = {
  id: 'CRE_S5PL2',
  shJsonGetCapabilitiesDataset: 'S5PL2',
  shWmsEvalsource: 'S5P_L2',
  shProcessingApiDatasourceAbbreviation: 'S5PL2',
  datasetParametersType: 'S5PL2',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S5PL2/searchIndex',
  findDatesUTCUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S5PL2/findAvailableData',
  orbitTimeMinutes: 101,
  minDate: new Date(Date.UTC(2018, 4 - 1, 30, 0, 18, 51)), // 2018-04-30T00:18:51
  maxDate: null,
  catalogCollectionId: 'sentinel-5p-l2',
};

export const DATASET_AWS_L8L1C: Dataset = {
  id: 'AWS_L8L1C',
  shJsonGetCapabilitiesDataset: 'L8L1C',
  shWmsEvalsource: 'L8',
  shProcessingApiDatasourceAbbreviation: 'L8L1C',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/L8L1C/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/L8L1C/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 59, 2)), // 2013-03-18T15:59:02.334
  maxDate: null,
  catalogCollectionId: 'landsat-8-l1c',
};

export const DATASET_AWS_LOTL1: Dataset = {
  id: 'AWS_LOTL1',
  shJsonGetCapabilitiesDataset: 'LOTL1',
  shWmsEvalsource: 'L8',
  shProcessingApiDatasourceAbbreviation: 'LOTL1',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL1/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL1/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 58, 14)), // 2013-03-18T15:58:14Z
  maxDate: null,
  catalogCollectionId: 'landsat-ot-l1',
};

export const DATASET_AWS_LOTL2: Dataset = {
  id: 'AWS_LOTL2',
  shJsonGetCapabilitiesDataset: 'LOTL2',
  shWmsEvalsource: 'L8',
  shProcessingApiDatasourceAbbreviation: 'LOTL2',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL2/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LOTL2/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2013, 3 - 1, 18, 15, 58, 14)), // 2013-03-18T15:58:14Z
  maxDate: null,
  catalogCollectionId: 'landsat-ot-l2',
};

export const DATASET_AWS_LTML1: Dataset = {
  id: 'AWS_LTML1',
  shJsonGetCapabilitiesDataset: 'LTML1',
  shWmsEvalsource: 'LTML1',
  shProcessingApiDatasourceAbbreviation: 'LTML1',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML1/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML1/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1982, 8 - 1, 22, 14, 18, 20)), // 1982-08-22 14:18:20 UTC
  maxDate: new Date(Date.UTC(2012, 5 - 1, 5, 17, 54, 6)), // 2012-05-05  17:54:06 UTC
  catalogCollectionId: 'landsat-tm-l1',
};

export const DATASET_AWS_LTML2: Dataset = {
  id: 'AWS_LTML2',
  shJsonGetCapabilitiesDataset: 'LTML2',
  shWmsEvalsource: 'LTML2',
  shProcessingApiDatasourceAbbreviation: 'LTML2',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML2/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LTML2/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1982, 8 - 1, 22, 14, 18, 20)), // 1982-08-22 14:18:20 UTC
  maxDate: new Date(Date.UTC(2012, 5 - 1, 5, 17, 54, 6)), // 2012-05-05  17:54:06 UTC
  catalogCollectionId: 'landsat-tm-l2',
};

export const DATASET_AWS_LMSSL1: Dataset = {
  id: 'AWS_LMSSL1',
  shJsonGetCapabilitiesDataset: 'LMSSL1',
  shWmsEvalsource: 'LMSSL1',
  shProcessingApiDatasourceAbbreviation: 'LMSSL1',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LMSSL1/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LMSSL1/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1972, 7 - 1, 1, 0, 0, 0)),
  maxDate: new Date(Date.UTC(2013, 1 - 1, 31, 23, 59, 59)),
  catalogCollectionId: 'landsat-mss-l1',
};

export const DATASET_AWS_LETML1: Dataset = {
  id: 'AWS_LETML1',
  shJsonGetCapabilitiesDataset: 'LETML1',
  shWmsEvalsource: 'LETML1',
  shProcessingApiDatasourceAbbreviation: 'LETML1',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML1/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML1/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1999, 4 - 1, 1, 0, 0, 0)),
  maxDate: null,
  catalogCollectionId: 'landsat-etm-l1',
};

export const DATASET_AWS_LETML2: Dataset = {
  id: 'AWS_LETML2',
  shJsonGetCapabilitiesDataset: 'LETML2',
  shWmsEvalsource: 'LETML2',
  shProcessingApiDatasourceAbbreviation: 'LETML2',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML2/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/LETML2/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1999, 4 - 1, 1, 0, 0, 0)),
  maxDate: null,
  catalogCollectionId: 'landsat-etm-l2',
};

export const DATASET_EOCLOUD_LANDSAT5: Dataset = {
  id: 'EOC_L5',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: 'L5',
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: null,
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat5/v2/search',
  findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat5/v2/dates',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1984, 4 - 1, 6, 7, 45, 13)), // 1984-04-06T07:45:13.428
  maxDate: new Date(Date.UTC(2011, 11 - 1, 16, 10, 2, 33)), // 2011-11-16T10:02:32.340
};

export const DATASET_EOCLOUD_LANDSAT7: Dataset = {
  id: 'EOC_L7',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: 'L7',
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: null,
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat7/v2/search',
  findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat7/v2/dates',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(1999, 7 - 1, 3, 19, 16, 17)), // 1999-07-03T19:16:17.163
  maxDate: new Date(Date.UTC(2017, 1 - 1, 15, 23, 49, 15)), // 2017-01-15T23:49:14.495
};

export const DATASET_EOCLOUD_LANDSAT8: Dataset = {
  id: 'EOC_L8',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: 'L8',
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: null,
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/landsat8/v2/search',
  findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/landsat8/v2/dates',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2013, 3 - 1, 24, 0, 25, 55)), // 2013-03-24T00:25:55.457
  maxDate: null,
};

export const DATASET_AWS_HLS: Dataset = {
  id: 'AWS_HLS',
  shJsonGetCapabilitiesDataset: 'HLS',
  shWmsEvalsource: 'HLS',
  shProcessingApiDatasourceAbbreviation: 'HLS',
  datasetParametersType: 'HLS',
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/HLS/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/HLS/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2013, 4 - 1, 1, 0, 25, 55)), // 2013-04-01T00:25:55.457
  maxDate: null,
  catalogCollectionId: 'hls',
};

export const DATASET_EOCLOUD_ENVISAT_MERIS: Dataset = {
  id: 'EOC_ENVISAT_MERIS',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: 'ENV',
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: null,
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/envisat/v1/search',
  findDatesUTCUrl: 'https://eocloud.sentinel-hub.com/index/envisat/v1/finddates',
  orbitTimeMinutes: 100.16,
  minDate: new Date(Date.UTC(2002, 5 - 1, 17, 14, 0, 27)), // 2002-05-17T14:00:27.893
  maxDate: new Date(Date.UTC(2012, 4 - 1, 8, 10, 58, 58)), // 2012-04-08T10:58:57.237
};

export const DATASET_MODIS: Dataset = {
  id: 'AWS_MODIS',
  shJsonGetCapabilitiesDataset: 'MODIS',
  shWmsEvalsource: 'Modis',
  shProcessingApiDatasourceAbbreviation: 'MODIS',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/MODIS/searchIndex',
  findDatesUTCUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/MODIS/findAvailableData',
  orbitTimeMinutes: 99,
  minDate: new Date(Date.UTC(2000, 2 - 1, 24, 12, 0, 0)), // 2000-02-24T12:00:00
  maxDate: null,
  catalogCollectionId: 'modis',
};

export const DATASET_AWS_DEM: Dataset = {
  id: 'AWS_DEM',
  shJsonGetCapabilitiesDataset: 'DEM',
  shWmsEvalsource: 'DEM',
  shProcessingApiDatasourceAbbreviation: 'DEM',
  datasetParametersType: null,
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: null,
  findDatesUTCUrl: null,
  orbitTimeMinutes: null,
  minDate: null,
  maxDate: null,
};

export const DATASET_AWSUS_DEM: Dataset = {
  id: 'AWSUS_DEM',
  shJsonGetCapabilitiesDataset: 'DEM',
  shWmsEvalsource: 'DEM',
  shProcessingApiDatasourceAbbreviation: 'DEM',
  datasetParametersType: null,
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: null,
  findDatesUTCUrl: null,
  orbitTimeMinutes: null,
  minDate: null,
  maxDate: null,
};

export const DATASET_BYOC: Dataset = {
  id: 'CUSTOM',
  shJsonGetCapabilitiesDataset: 'CUSTOM',
  shWmsEvalsource: 'CUSTOM',
  shProcessingApiDatasourceAbbreviation: 'CUSTOM',
  datasetParametersType: 'BYOC',
  shServiceHostname: null, // depends on location, for example: https://services.sentinel-hub.com/
  searchIndexUrl: null, // depends on location, for example: https://services.sentinel-hub.com/byoc/v3/collections/CUSTOM/searchIndex
  findDatesUTCUrl: null, // depends on location, for example: https://services.sentinel-hub.com/byoc/v3/collections/CUSTOM/findAvailableData
  orbitTimeMinutes: null,
  minDate: null,
  maxDate: null,
  catalogCollectionId: null,
};

export const DATASET_PLANET_NICFI: Dataset = {
  id: 'PLANET_NICFI',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: null,
  shProcessingApiDatasourceAbbreviation: null,
  datasetParametersType: null,
  shServiceHostname: null,
  searchIndexUrl: null,
  findDatesUTCUrl: null,
  orbitTimeMinutes: null,
  minDate: new Date(Date.UTC(2016, 6 - 1, 31, 12, 0, 0)), // '2016-05-31',
  maxDate: null,
};
