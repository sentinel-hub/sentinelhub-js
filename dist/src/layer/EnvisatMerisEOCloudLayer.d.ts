import { Link } from './const';
import { AbstractSentinelHubV1OrV2Layer } from './AbstractSentinelHubV1OrV2Layer';
export declare class EnvisatMerisEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
    readonly dataset: import("./dataset").Dataset;
    static makeLayer(layerInfo: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    instanceId: string, layerId: string, evalscript: string | null, evalscriptUrl: string | null, title: string | null, description: string | null): EnvisatMerisEOCloudLayer;
    protected getTileLinks(tile: Record<string, any>): Link[];
}
