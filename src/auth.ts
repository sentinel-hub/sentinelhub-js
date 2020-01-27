let authToken: string | null = null;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(newAuthToken: string): void {
  authToken = newAuthToken;
}

export function isAuthTokenSet(): boolean {
  return authToken !== null;
}
