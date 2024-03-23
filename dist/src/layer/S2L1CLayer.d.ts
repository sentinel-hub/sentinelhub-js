import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { Link } from './const';
export declare class S2L1CLayer extends AbstractSentinelHubV3WithCCLayer {
    readonly dataset: import("./dataset").Dataset;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
}
