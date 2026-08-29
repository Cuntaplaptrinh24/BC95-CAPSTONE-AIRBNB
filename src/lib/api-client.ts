import axios from 'axios';
import { getApiBaseUrl, getCybersoftToken } from './env';

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers.set('tokenCybersoft', getCybersoftToken());
  return config;
});

// Type header chính thức của Axios cho các request cần xác thực.
export type AuthHeader = import('axios').AxiosRequestHeaders;

// Helper từ access token sang header xác thực User.
export function buildAuthHeaders(accessToken: string): AuthHeader {
  return new axios.AxiosHeaders({ token: accessToken });
}
