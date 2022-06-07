import { AbstractLandsatLayer } from './AbstractLandsatLayer';

export class AbstractLandsat8Layer extends AbstractLandsatLayer {
  protected extractFindTilesMeta(tile: any): Record<string, any> {
    return {
      ...super.extractFindTilesMeta(tile),
      sunElevation: tile.sunElevation,
    };
  }

  protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any> {
    return {
      ...super.extractFindTilesMetaFromCatalog(feature),
      sunElevation: feature.properties['view:sun_elevation'],
      projEpsg: feature.properties['proj:epsg'],
    };
  }
}
