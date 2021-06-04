export type CRS = {
  authId: CRS_IDS;
  auth: string;
  srid: number;
  urn: CRS_URN;
  opengisUrl: string;
};

export type CRS_IDS = 'EPSG:3857' | 'CRS:84' | 'EPSG:4326';

export type CRS_URN =
  | 'urn:ogc:def:crs:EPSG::3857'
  | 'urn:ogc:def:crs:EPSG::4326'
  | 'urn:ogc:def:crs:OGC:1.3:CRS84';

/**
 * The most common CRS for online maps, used by almost all free and commercial tile providers. Uses Spherical Mercator projection.
 */
export const CRS_EPSG3857: CRS = {
  authId: 'EPSG:3857',
  auth: 'EPSG',
  srid: 3857,
  urn: 'urn:ogc:def:crs:EPSG::3857',
  opengisUrl: 'http://www.opengis.net/def/crs/EPSG/0/3857',
};

/**
 * EPSG:4326 is identifier of World Geodetic System (WGS84) which comprises of a reference ellipsoid, a standard coordinate system, altitude data and a geoid.
 */
export const CRS_EPSG4326: CRS = {
  authId: 'EPSG:4326',
  auth: 'EPSG',
  srid: 4326,
  urn: 'urn:ogc:def:crs:EPSG::4326',
  opengisUrl: 'http://www.opengis.net/def/crs/EPSG/0/4326',
};

export const CRS_WGS84: CRS = {
  authId: 'CRS:84',
  auth: 'CRS',
  srid: 84,
  urn: 'urn:ogc:def:crs:OGC:1.3:CRS84',
  opengisUrl: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
};

export const SUPPORTED_CRS_OBJ = {
  [CRS_EPSG3857.authId]: CRS_EPSG3857,
  [CRS_EPSG4326.authId]: CRS_EPSG4326,
  [CRS_WGS84.authId]: CRS_WGS84,
};

declare module '@turf/helpers' {
  export interface GeometryObject {
    crs?: {
      type: 'name';
      properties: {
        name: CRS_URN;
      };
    };
  }
}

export function findCrsFromUrn(urn: CRS_URN): CRS {
  switch (urn) {
    case 'urn:ogc:def:crs:EPSG::3857':
      return CRS_EPSG3857;
    case 'urn:ogc:def:crs:EPSG::4326':
      return CRS_EPSG4326;
    case 'urn:ogc:def:crs:OGC:1.3:CRS84':
      return CRS_WGS84;
    default:
      throw new Error('CRS not found');
  }
}
