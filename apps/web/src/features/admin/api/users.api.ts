import type { ListUsersQuery, PaginatedResponse } from '@notifyhub/shared';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/domain';

export async function listUsers(query: ListUsersQuery): Promise<PaginatedResponse<AuthUser>> {
  const { data } = await apiClient.get<PaginatedResponse<AuthUser>>('/users', {
    params: query,
  });
  return data;
}
