declare module '@turf/union' {
  import { MultiPolygon, Polygon, Feature } from '@turf/helpers';
  export default function union(
    poly1: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon,
    poly2: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon,
  ): Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon;
}
