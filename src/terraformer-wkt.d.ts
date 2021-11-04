declare module '@terraformer/wkt' {
  import { GeoJSONObject } from '@turf/helpers';

  export function wktToGeoJSON(wkt: string): GeoJSONObject;
  export function geojsonToWKT(geoJSON: GeoJSONObject): string;
}
