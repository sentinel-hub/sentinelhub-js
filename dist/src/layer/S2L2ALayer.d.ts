import { AbstractSentinelHubV3WithCCLayer } from './AbstractSentinelHubV3WithCCLayer';
import { ProcessingPayload } from './processing';
import { Link } from './const';
export declare class S2L2ALayer extends AbstractSentinelHubV3WithCCLayer {
    readonly dataset: import("./dataset").Dataset;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
    private createPreviewLinkFromDataUri;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
    protected extractFindTilesMeta(tile: any): Record<string, any>;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
}
