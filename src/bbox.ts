import { CRS } from 'src/crs';

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
}
