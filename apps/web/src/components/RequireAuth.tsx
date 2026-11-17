import { Navigate, Outlet, useLocation } from 'react-router';
import type { Role } from '@notifyhub/shared';
import { useAuthStore } from '@/stores/auth.store';

interface RequireAuthProps {
  role?: Role;
}

export function RequireAuth({ role }: RequireAuthProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/products" replace />;
  return <Outlet />;
}
