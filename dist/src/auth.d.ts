export declare function getAuthToken(): string | null;
export declare function setAuthToken(newAuthToken: string | null): void;
export declare function isAuthTokenSet(): boolean;
export declare function requestAuthToken(clientId: string, clientSecret: string): Promise<any>;
