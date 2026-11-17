import { ORDER_STATUSES, type OrderStatus } from '@notifyhub/shared';
import { listOrders } from '@/features/orders/api/orders.api';
import { listProducts } from '@/features/products/api/products.api';
import { listUsers } from '@/features/admin/api/users.api';
import type { Order } from '@/types/domain';

export interface AdminDashboardStats {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  activeProducts: number;
  userAccounts: number;
  recentOrders: Order[];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [recentOrders, products, users, ...statusPages] = await Promise.all([
    listOrders({ page: 1, limit: 5 }),
    listProducts({ page: 1, limit: 1, sort: 'createdAt', order: 'desc' }),
    listUsers({ page: 1, limit: 1 }),
    ...ORDER_STATUSES.map((status) => listOrders({ page: 1, limit: 1, status })),
  ]);

  const ordersByStatus: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  ORDER_STATUSES.forEach((status, index) => {
    const result = statusPages[index];
    if (result) ordersByStatus[status] = result.meta.total;
  });

  return {
    totalOrders: recentOrders.meta.total,
    ordersByStatus,
    activeProducts: products.meta.total,
    userAccounts: users.meta.total,
    recentOrders: recentOrders.data,
  };
}
