export enum TPDICollections {
  AIRBUS_PLEIADES = 'AIRBUS_PLEIADES',
  AIRBUS_SPOT = 'AIRBUS_SPOT',
  PLANET_SCOPE = 'PLANET_SCOPE',
  MAXAR_WORLDVIEW = 'MAXAR_WORLDVIEW',
}

export type Quota = {
  collectionId: TPDICollections;
  quotaSqkm: number;
  quotaUsed: number;
};

export const TPDI_SERVICE_URL = 'https://services.sentinel-hub.com/api/v1/dataimport';
