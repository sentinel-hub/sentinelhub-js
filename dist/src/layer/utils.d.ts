import { OgcServiceTypes } from './const';
import { RequestConfiguration } from '../utils/cancelRequests';
import { GetCapabilitiesWmtsXml } from './wmts.utils';
export declare type GetCapabilitiesWmsXml = {
    WMS_Capabilities: {
        Service: [];
        Capability: [{
            Layer: [GetCapabilitiesXmlLayer];
        }];
    };
};
export declare type GetCapabilitiesXmlLayer = {
    Name?: string[];
    Title: string[];
    Abstract: string[];
    Style: any[];
    Dimension?: any[];
    Layer?: GetCapabilitiesXmlLayer[];
    ResourceUrl?: string;
};
export declare function createGetCapabilitiesXmlUrl(baseUrl: string, ogcServiceType: OgcServiceTypes): string;
export declare function fetchGetCapabilitiesXml(baseUrl: string, ogcServiceType: OgcServiceTypes, reqConfig: RequestConfiguration): Promise<GetCapabilitiesWmsXml | GetCapabilitiesWmtsXml>;
export declare function fetchLayersFromGetCapabilitiesXml(baseUrl: string, ogcServiceType: OgcServiceTypes, reqConfig: RequestConfiguration): Promise<GetCapabilitiesXmlLayer[]>;
export declare function fetchGetCapabilitiesJson(baseUrl: string, reqConfig: RequestConfiguration): Promise<any[]>;
export declare function fetchGetCapabilitiesJsonV1(baseUrl: string, reqConfig: RequestConfiguration): Promise<any[]>;
export declare function parseSHInstanceId(baseUrl: string): string;
export declare function fetchLayerParamsFromConfigurationService(instanceId: string, reqConfig: RequestConfiguration): Promise<any[]>;
