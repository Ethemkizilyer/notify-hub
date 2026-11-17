import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListUsersQuery } from '@notifyhub/shared';
import { listUsers } from '@/features/admin/api/users.api';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (query: ListUsersQuery) => [...adminUserKeys.all, 'list', query] as const,
};

export function useAdminUsers(query: ListUsersQuery) {
  return useQuery({
    queryKey: adminUserKeys.list(query),
    queryFn: () => listUsers(query),
    placeholderData: keepPreviousData,
  });
}
