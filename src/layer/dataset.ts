export type Dataset = {
  id: string;
  shJsonGetCapabilitiesDataset: string | null;
  shWmsEvalsource: string;
  shProcessingApiDatasourceAbbreviation: string;
  shServiceHostname: string;
  searchIndexUrl: string;
  orbitTimeMinutes: number;
};

export const DATASET_AWSEU_S1GRD: Dataset = {
  id: 'AWSEU_S1GRD',
  shJsonGetCapabilitiesDataset: 'S1GRD',
  shWmsEvalsource: 'S1GRD',
  shProcessingApiDatasourceAbbreviation: 'S1GRD',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S1GRD/searchIndex',
  orbitTimeMinutes: 49.3,
};

export const DATASET_EOCLOUD_S1GRD: Dataset = {
  id: 'EOC_S1GRD_IW',
  shJsonGetCapabilitiesDataset: null,
  shWmsEvalsource: null, // it's complicated - allowed values are 'S1' (for IW) and 'S1_EW'
  shProcessingApiDatasourceAbbreviation: null,
  shServiceHostname: 'https://eocloud.sentinel-hub.com/',
  searchIndexUrl: 'https://eocloud.sentinel-hub.com/index/s1/v1/search',
  orbitTimeMinutes: 49.3,
};

export const DATASET_S2L2A: Dataset = {
  id: 'AWS_S2L2A',
  shJsonGetCapabilitiesDataset: 'S2L2A',
  shWmsEvalsource: 'S2L2A',
  shProcessingApiDatasourceAbbreviation: 'S2L2A',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
  orbitTimeMinutes: 50.3,
};

export const DATASET_S2L1C: Dataset = {
  id: 'AWS_S2L1C',
  shJsonGetCapabilitiesDataset: 'S2L1C',
  shWmsEvalsource: 'S2',
  shProcessingApiDatasourceAbbreviation: 'S2L1C',
  shServiceHostname: 'https://services.sentinel-hub.com/',
  searchIndexUrl: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
  orbitTimeMinutes: 50.3,
};

export const DATASET_S3SLSTR: Dataset = {
  id: 'CRE_S3SLSTR',
  shJsonGetCapabilitiesDataset: 'S3SLSTR',
  shWmsEvalsource: 'S3SLSTR',
  shProcessingApiDatasourceAbbreviation: 'S3SLSTR',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3SLSTR/searchIndex',
  orbitTimeMinutes: 50.495,
};

export const DATASET_S3OLCI: Dataset = {
  id: 'CRE_S3OLCI',
  shJsonGetCapabilitiesDataset: 'S3OLCI',
  shWmsEvalsource: 'S3OLCI',
  shProcessingApiDatasourceAbbreviation: 'S3OLCI',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
  orbitTimeMinutes: 50.495,
};

export const DATASET_S5PL2: Dataset = {
  id: 'CRE_S5PL2',
  shJsonGetCapabilitiesDataset: 'S5PL2',
  shWmsEvalsource: 'S5P_L2',
  shProcessingApiDatasourceAbbreviation: 'S5PL2',
  shServiceHostname: 'https://creodias.sentinel-hub.com/',
  searchIndexUrl: 'https://creodias.sentinel-hub.com/index/v3/collections/S5PL2/searchIndex',
  orbitTimeMinutes: 101,
};

export const DATASET_AWS_L8L1C: Dataset = {
  id: 'AWS_L8L1C',
  shJsonGetCapabilitiesDataset: 'L8L1C',
  shWmsEvalsource: 'L8',
  shProcessingApiDatasourceAbbreviation: 'L8L1C',
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/L8L1C/searchIndex',
  orbitTimeMinutes: 99,
};

export const DATASET_MODIS: Dataset = {
  id: 'AWS_MODIS',
  shJsonGetCapabilitiesDataset: 'MODIS',
  shWmsEvalsource: 'Modis',
  shProcessingApiDatasourceAbbreviation: 'MODIS',
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: 'https://services-uswest2.sentinel-hub.com/index/v3/collections/MODIS/searchIndex',
  orbitTimeMinutes: 99,
};

export const DATASET_AWS_DEM: Dataset = {
  id: 'AWS_DEM',
  shJsonGetCapabilitiesDataset: 'DEM',
  shWmsEvalsource: 'DEM',
  shProcessingApiDatasourceAbbreviation: 'DEM',
  shServiceHostname: 'https://services-uswest2.sentinel-hub.com/',
  searchIndexUrl: null,
  orbitTimeMinutes: null,
};
