import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { ApiType, DataProductId, DEMInstanceType, GetMapParams, Interpolator, PaginatedTiles } from './const';
import { ProcessingPayload } from './processing';
import { RequestConfiguration } from '../utils/cancelRequests';
import { BBox } from '../bbox';
export interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    dataProduct?: DataProductId | null;
    title?: string | null;
    description?: string | null;
    upsampling?: Interpolator | null;
    downsampling?: Interpolator | null;
    legendUrl?: string | null;
    demInstance?: DEMInstanceType | null;
    egm?: boolean | null;
    clampNegative?: boolean | null;
}
export declare class AbstractDEMLayer extends AbstractSentinelHubV3Layer {
    protected demInstance: DEMInstanceType;
    protected egm: boolean;
    protected clampNegative: boolean;
    private layerUpdatedFromService;
    constructor({ demInstance, egm, clampNegative, ...rest }: ConstructorParameters);
    private shouldUpdateLayerFromService;
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
    getMap(params: GetMapParams, api: ApiType, reqConfig?: RequestConfiguration): Promise<Blob>;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number): Promise<ProcessingPayload>;
    private bboxToPolygon;
    findTiles(bbox: BBox, fromTime: Date, // eslint-disable-line @typescript-eslint/no-unused-vars
    toTime: Date, maxCount?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    offset?: number | null, // eslint-disable-line @typescript-eslint/no-unused-vars
    reqConfig?: RequestConfiguration): Promise<PaginatedTiles>;
    findDatesUTC(bbox: BBox, fromTime: Date, toTime: Date, reqConfig?: RequestConfiguration): Promise<Date[]>;
}
