import MockAdapter from 'axios-mock-adapter';
export declare const mockNetwork: MockAdapter;
export declare const AUTH_TOKEN = "AUTH_TOKEN";
export declare const CATALOG_URL = "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search";
export declare function checkRequestFindTiles(fixtures: Record<string, any>): Promise<void>;
export declare function checkResponseFindTiles(fixtures: Record<string, any>): Promise<void>;
export declare function checkIfCorrectEndpointIsUsed(token: string, fixture: Record<string, any>, endpoint: string): Promise<void>;
