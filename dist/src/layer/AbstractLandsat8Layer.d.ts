import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link } from './const';
export declare class AbstractLandsat8Layer extends AbstractSentinelHubV3WithCCLayer {
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
