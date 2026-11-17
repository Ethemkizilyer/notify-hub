import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { ListOrdersQuery, OrderStatus } from '@notifyhub/shared';
import { queryClient } from '@/lib/query-client';
import {
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from '@/features/orders/api/orders.api';

export const orderKeys = {
  all: ['orders'] as const,
  list: (query: ListOrdersQuery) => ['orders', 'list', query] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};

function invalidateOrders() {
  return queryClient.invalidateQueries({ queryKey: orderKeys.all });
}

export function useOrders(query: ListOrdersQuery) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => listOrders(query),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: id.length > 0,
  });
}

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder, onSuccess: invalidateOrders });
}

export function useCancelOrder() {
  return useMutation({ mutationFn: cancelOrder, onSuccess: invalidateOrders });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: invalidateOrders,
  });
}
