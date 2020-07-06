import axios from 'axios';

let authToken: string | null = null;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(newAuthToken: string | null): void {
  authToken = newAuthToken;
}

export function isAuthTokenSet(): boolean {
  return authToken !== null;
}

export async function requestAuthToken(clientId: string, clientSecret: string): Promise<any> {
  const response = await axios({
    method: 'post',
    url: 'https://services.sentinel-hub.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `grant_type=client_credentials&client_id=${encodeURIComponent(
      clientId,
    )}&client_secret=${encodeURIComponent(clientSecret)}`,
  });
  return response.data.access_token;
}
