import { RequestConfiguration } from '..';
import { BBox } from '../bbox';
import { GetCapabilitiesXmlLayer } from './utils';
export declare type GetCapabilitiesWmtsXml = {
    Capabilities: {
        'ows:ServiceIdentification': any[][];
        'ows:ServiceProvider': any[][];
        'ows:OperationsMetadata': any[][];
        Contents: [{
            Layer: GetCapabilitiesXmlWmtsLayer[];
            TileMatrixSet: GetCapabilitiesXmlWmtsTileMatrixSet[];
        }];
        ServiceMetadataURL: any[][];
    };
};
export declare type GetCapabilitiesXmlWmtsLayer = {
    'ows:Title': string[];
    'ows:Abstract': string[];
    'ows:WGS84BoundingBox': {}[][];
    'ows:Identifier': string[];
    Style: any[];
    Format: string[];
    TileMatrixSetLink: any[];
    ResourceURL: any[];
};
export declare type GetCapabilitiesXmlWmtsTileMatrixSet = {
    TileMatrix: GetCapabilitiesXmlWmtsTileMatrix[];
    'ows:Identifier': string[];
    'ows:SupportedCRS': string[];
};
declare type GetCapabilitiesXmlWmtsTileMatrix = {
    MatrixHeight: string[];
    MatrixWidth: string[];
    ScaleDenominator: string[];
    TileHeight: string[];
    TileWidth: string[];
    TopLeftCorner: string[];
    'ows:Identifier': string[];
};
export declare type TileMatrix = {
    zoom: number;
    tileWidth: number;
    tileHeight: number;
    matrixWidth: number;
    matrixHeight: number;
};
export declare type MatrixSet = {
    id: string;
    tileMatrices: TileMatrix[];
};
export declare type BBOX_TO_XYZ_IMAGE_GRID = {
    nativeWidth: number;
    nativeHeight: number;
    tiles: {
        x: number;
        y: number;
        z: number;
        imageOffsetX: number;
        imageOffsetY: number;
    }[];
};
export declare function bboxToXyzGrid(bbox: BBox, imageWidth: number, imageHeight: number, tileMatrices: TileMatrix[]): BBOX_TO_XYZ_IMAGE_GRID;
export declare function toPixel(coord: number[], tileMatrices: TileMatrix[], zoom: number): {
    pixelX: number;
    pixelY: number;
};
export declare function fetchLayersFromWmtsGetCapabilitiesXml(baseUrl: string, reqConfig: RequestConfiguration): Promise<GetCapabilitiesXmlLayer[]>;
export declare function getResourceUrl(xmlLayer: GetCapabilitiesXmlWmtsLayer): string | null;
export declare function getMatrixSets(baseUrl: string, reqConfig: RequestConfiguration): Promise<MatrixSet[]>;
export {};
