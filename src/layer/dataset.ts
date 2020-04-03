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
  minDate: new Date(Date.UTC(2014, 12 - 1, 7, 4, 14, 15)), // 2014-12-07T04:14:15Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(2014, 10 - 1, 3, 10, 10, 18)), // 2014-10-03T10:10:18.000s
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
  minDate: new Date(Date.UTC(2015, 6 - 1, 27, 0, 25, 31)), // 2015-06-27T10:25:31Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(2016, 4 - 1, 19, 0, 46, 32)), // 2016-04-19T00:46:32.578Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(2016, 4 - 1, 25, 11, 33, 14)), // 2016-04-25T11:33:14Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(2018, 4 - 1, 30, 0, 18, 51)), // 2018-04-30T00:18:51Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(2013, 3 - 1, 19, 3, 30, 14)), // 2013-03-19T03:30:14.095Z
  maxDate: null,
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
  minDate: new Date(Date.UTC(1990, 4 - 1, 3, 9, 29, 21)), // 1990-04-03T09:29:21.808
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
  minDate: new Date(Date.UTC(1999, 7 - 1, 9, 10, 10, 28)), // 1999-07-09T10:10:28.737
  maxDate: new Date(Date.UTC(2017, 1 - 1, 8, 3, 47, 23)), // 2017-01-08T03:47:22.049Z,
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
  minDate: new Date(Date.UTC(2013, 4 - 1, 1, 3, 48, 51)), // 2013-04-01T03:48:51.190
  maxDate: null,
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
  minDate: new Date(Date.UTC(2002, 5 - 1, 20, 10, 26, 26)), // 2002-05-20T10:26:26.497
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
  minDate: new Date(Date.UTC(2000, 2 - 1, 24, 12, 0, 0)), // 2000-02-24T12:00:00Z
  maxDate: null,
};

export const DATASET_AWS_DEM: Dataset = {
  id: 'AWS_DEM',
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
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/byoc/v3/collections/CUSTOM/searchIndex',
  findDatesUTCUrl: 'https://services.sentinel-hub.com/byoc/v3/collections/CUSTOM/findAvailableData',
  orbitTimeMinutes: null,
  minDate: null,
  maxDate: null,
};
