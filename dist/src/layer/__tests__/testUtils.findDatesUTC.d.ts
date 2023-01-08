export declare const AUTH_TOKEN = "AUTH_TOKEN";
export declare const CATALOG_URL = "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search";
export declare function checkIfCorrectEndpointIsUsedFindDatesUTC(token: string, fixture: Record<string, any>, endpoint: string): Promise<void>;
export declare function checkRequestFindDatesUTC(fixtures: Record<string, any>): Promise<void>;
export declare function checkResponseFindDatesUTC(fixtures: Record<string, any>): Promise<void>;
