import { PaginatedTiles, Link } from './const';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
export declare class S3OLCILayer extends AbstractSentinelHubV3Layer {
    readonly dataset: import("./dataset").Dataset;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
