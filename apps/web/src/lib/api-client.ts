import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@notifyhub/shared';
import type { AuthSession } from '@/types/domain';
import { useAuthStore } from '@/stores/auth.store';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<ApiResponse<AuthSession>>(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.data);
      return data.data.accessToken;
    })
    .catch((error: unknown) => {
      useAuthStore.getState().clear();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;

  const original = error.config as RetryableConfig;
  if (original._retry || original.url?.startsWith('/auth/')) throw error;

  original._retry = true;
  const token = await refreshAccessToken();
  original.headers.Authorization = `Bearer ${token}`;
  return apiClient(original);
});
