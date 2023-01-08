import { Geometry } from '@turf/helpers';
import { BBox } from '../bbox';
import { BackscatterCoeff, DEMInstanceTypeOrthorectification, PaginatedTiles, OrbitDirection, Link, DataProductId, FindTilesAdditionalParameters } from './const';
import { ProcessingPayload } from './processing';
import { AbstractSentinelHubV3Layer } from './AbstractSentinelHubV3Layer';
import { RequestConfiguration } from '../utils/cancelRequests';
export declare enum AcquisitionMode {
    IW = "IW",
    EW = "EW"
}
export declare enum Polarization {
    DV = "DV",
    SH = "SH",
    DH = "DH",
    SV = "SV"
}
export declare enum Resolution {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM"
}
export declare enum SpeckleFilterType {
    NONE = "NONE",
    LEE = "LEE"
}
export declare type SpeckleFilter = {
    type: SpeckleFilterType;
    windowSizeX: number;
    windowSizeY: number;
};
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    dataProduct?: DataProductId | null;
    title?: string | null;
    description?: string | null;
    legendUrl?: string | null;
    acquisitionMode?: AcquisitionMode | null;
    polarization?: Polarization | null;
    resolution?: Resolution | null;
    orthorectify?: boolean | null;
    demInstanceType?: DEMInstanceTypeOrthorectification | null;
    backscatterCoeff?: BackscatterCoeff | null;
    orbitDirection?: OrbitDirection | null;
    speckleFilter?: SpeckleFilter | null;
}
export declare class S1GRDAWSEULayer extends AbstractSentinelHubV3Layer {
    readonly dataset: import("./dataset").Dataset;
    acquisitionMode: AcquisitionMode;
    polarization: Polarization;
    resolution: Resolution | null;
    orbitDirection: OrbitDirection | null;
    orthorectify: boolean | null;
    demInstanceType: DEMInstanceTypeOrthorectification | null;
    backscatterCoeff: BackscatterCoeff | null;
    speckleFilter: SpeckleFilter | null;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, dataProduct, title, description, legendUrl, acquisitionMode, polarization, resolution, orthorectify, demInstanceType, backscatterCoeff, orbitDirection, speckleFilter, }: ConstructorParameters);
    updateLayerFromServiceIfNeeded(reqConfig?: RequestConfiguration): Promise<void>;
    _updateProcessingGetMapPayload(payload: ProcessingPayload, datasetSeqNo?: number, reqConfig?: RequestConfiguration): Promise<ProcessingPayload>;
    protected convertResponseFromSearchIndex(response: {
        data: {
            tiles: any[];
            hasMore: boolean;
        };
    }): PaginatedTiles;
    protected extractFindTilesMetaFromCatalog(feature: Record<string, any>): Record<string, any>;
    protected getFindTilesAdditionalParameters(): FindTilesAdditionalParameters;
    protected findTilesInner(bbox: BBox, fromTime: Date, toTime: Date, maxCount?: number | null, offset?: number | null, reqConfig?: RequestConfiguration, intersects?: Geometry): Promise<PaginatedTiles>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    protected getTileLinks(tile: Record<string, any>): Link[];
    protected createCatalogFilterQuery(maxCloudCoverPercent?: number | null, datasetParameters?: Record<string, any> | null): Record<string, any>;
    protected getTileLinksFromCatalog(feature: Record<string, any>): Link[];
}
export {};
