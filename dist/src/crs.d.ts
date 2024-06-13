export declare type CRS = {
    authId: CRS_IDS;
    auth: string;
    srid: number;
    urn: CRS_URN;
    opengisUrl: string;
};
export declare type CRS_IDS = 'EPSG:3857' | 'CRS:84' | 'EPSG:4326';
export declare type CRS_URN = 'urn:ogc:def:crs:EPSG::3857' | 'urn:ogc:def:crs:EPSG::4326' | 'urn:ogc:def:crs:OGC:1.3:CRS84';
/**
 * The most common CRS for online maps, used by almost all free and commercial tile providers. Uses Spherical Mercator projection.
 */
export declare const CRS_EPSG3857: CRS;
/**
 * EPSG:4326 is identifier of World Geodetic System (WGS84) which comprises of a reference ellipsoid, a standard coordinate system, altitude data and a geoid.
 */
export declare const CRS_EPSG4326: CRS;
/**
 * Same as EPSG:4326, but with a switched coordinate order.
 */
export declare const CRS_WGS84: CRS;
export declare const SUPPORTED_CRS_OBJ: {
    [x: string]: CRS;
};
declare module '@turf/helpers' {
    interface GeometryObject {
        crs?: {
            type: 'name';
            properties: {
                name: CRS_URN;
            };
        };
    }
}
export declare function findCrsFromUrn(urn: CRS_URN): CRS;
