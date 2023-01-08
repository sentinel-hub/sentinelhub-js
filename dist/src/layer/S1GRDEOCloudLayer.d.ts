import { AbstractSentinelHubV1OrV2Layer } from './AbstractSentinelHubV1OrV2Layer';
import { AcquisitionMode, Polarization } from './S1GRDAWSEULayer';
import { OrbitDirection, MosaickingOrder, Link } from './const';
import { RequestConfiguration } from '../utils/cancelRequests';
interface ConstructorParameters {
    instanceId?: string | null;
    layerId?: string | null;
    evalscript?: string | null;
    evalscriptUrl?: string | null;
    mosaickingOrder?: MosaickingOrder | null;
    title?: string | null;
    description?: string | null;
    acquisitionMode?: AcquisitionMode | null;
    polarization?: Polarization | null;
    orbitDirection?: OrbitDirection | null;
}
export declare class S1GRDEOCloudLayer extends AbstractSentinelHubV1OrV2Layer {
    readonly dataset: import("./dataset").Dataset;
    acquisitionMode: AcquisitionMode;
    polarization: Polarization;
    orbitDirection: OrbitDirection | null;
    constructor({ instanceId, layerId, evalscript, evalscriptUrl, mosaickingOrder, title, description, acquisitionMode, polarization, orbitDirection, }: ConstructorParameters);
    static makeLayer(layerInfo: any, instanceId: string, layerId: string, evalscript: string | null, evalscriptUrl: string | null, title: string | null, description: string | null): S1GRDEOCloudLayer;
    getEvalsource(): string;
    protected getFindTilesAdditionalParameters(): Record<string, any>;
    protected getFindDatesUTCAdditionalParameters(reqConfig: RequestConfiguration): Promise<Record<string, any>>;
    protected getTileLinks(tile: Record<string, any>): Link[];
}
export {};
