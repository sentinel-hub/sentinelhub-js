declare module '@turf/union' {
  import { MultiPolygon, Polygon, Feature } from '@turf/helpers';
  export default function union(
    poly1: Polygon | MultiPolygon,
    poly2: Polygon | MultiPolygon,
  ): Feature<Polygon | MultiPolygon>;
}
