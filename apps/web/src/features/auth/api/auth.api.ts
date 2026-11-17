import type { ApiResponse, LoginInput, RegisterInput } from '@notifyhub/shared';
import { apiClient } from '@/lib/api-client';
import type { AuthSession, AuthUser } from '@/types/domain';

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', input);
  return data.data;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>('/auth/register', input);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
