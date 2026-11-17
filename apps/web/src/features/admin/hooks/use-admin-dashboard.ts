import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from '@/features/admin/api/dashboard.api';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboardStats,
    staleTime: 30_000,
  });
}
