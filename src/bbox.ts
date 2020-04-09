import { CRS } from 'src/crs';
import { Polygon } from '@turf/helpers';

export class BBox {
  public crs: CRS;
  public minX: number;
  public minY: number;
  public maxX: number;
  public maxY: number;

  public constructor(crs: CRS, minX: number, minY: number, maxX: number, maxY: number) {
    if (minX >= maxX) {
      throw new Error('MinX should be lower than maxX');
    }
    if (minY >= maxY) {
      throw new Error('MinY should be lower than maxY');
    }
    this.crs = crs;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  // Note that Turf's Polygon type (which is basically what we are returning) doesn't
  // allow 'crs' property, so we must return type :any.
  public toGeoJSON(): Polygon {
    return {
      type: 'Polygon',
      crs: { type: 'name', properties: { name: this.crs.urn } },
      coordinates: [
        [
          [this.minX, this.minY],
          [this.maxX, this.minY],
          [this.maxX, this.maxY],
          [this.minX, this.maxY],
          [this.minX, this.minY],
        ],
      ],
    };
  }
}
