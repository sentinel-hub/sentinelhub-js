import { CRS } from './crs';
import { Polygon } from '@turf/helpers';
export declare class BBox {
    crs: CRS;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    constructor(crs: CRS, minX: number, minY: number, maxX: number, maxY: number);
    toGeoJSON(): Polygon;
}
