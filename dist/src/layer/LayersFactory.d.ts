import { AbstractLayer } from './AbstractLayer';
import { RequestConfiguration } from '../utils/cancelRequests';
export declare class LayersFactory {
    private static readonly DATASET_FROM_JSON_GETCAPAPABILITIES;
    private static readonly DATASET_FROM_JSON_GETCAPABILITIES_V1;
    private static readonly LAYER_FROM_DATASET_V3;
    private static readonly LAYER_FROM_DATASET_V12;
    private static matchDatasetFromGetCapabilities;
    static makeLayer(baseUrl: string, layerId: string, overrideConstructorParams: Record<string, any> | null, reqConfig?: RequestConfiguration, preferGetCapabilities?: boolean): Promise<AbstractLayer>;
    static makeLayers(baseUrl: string, filterLayers?: Function | null, overrideConstructorParams?: Record<string, any> | null, reqConfig?: RequestConfiguration, preferGetCapabilities?: boolean): Promise<AbstractLayer[]>;
    private static makeLayersSHv3;
    private static getSHv3LayersInfo;
    private static makeLayersSHv12;
    private static makeLayersWms;
    private static makeLayersWmts;
    private static makePlanetBasemapLayers;
}
