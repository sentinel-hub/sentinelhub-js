declare module '@turf/union' {
  import { MultiPolygon, Polygon } from '@turf/helpers';
  export default function union(
    poly1: Polygon | MultiPolygon,
    poly2: Polygon | MultiPolygon,
  ): Polygon | MultiPolygon;
}
