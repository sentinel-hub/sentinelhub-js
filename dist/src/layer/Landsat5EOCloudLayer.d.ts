import { AbstractSentinelHubV1OrV2WithCCLayer } from './AbstractSentinelHubV1OrV2WithCCLayer';
import { Link } from './const';
export declare class Landsat5EOCloudLayer extends AbstractSentinelHubV1OrV2WithCCLayer {
    readonly dataset: import("./dataset").Dataset;
    static makeLayer(layerInfo: any, instanceId: string, layerId: string, evalscript: string | null, evalscriptUrl: string | null, title: string | null, description: string | null): Landsat5EOCloudLayer;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected extractFindTilesMeta(tile: any): Record<string, any>;
}
