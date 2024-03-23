import { AbstractLandsat8Layer } from './AbstractLandsat8Layer';
import { Link } from './const';
export declare class Landsat8AWSLOTL1Layer extends AbstractLandsat8Layer {
    readonly dataset: import("./dataset").Dataset;
    private getPreviewUrl;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
