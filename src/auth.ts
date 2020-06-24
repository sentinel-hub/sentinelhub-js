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
  let response = await axios({
    method: 'post',
    url: 'https://services.sentinel-hub.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });
  return response.data.access_token;
}
