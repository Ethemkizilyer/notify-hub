import type {
  ApiResponse,
  CreateOrderInput,
  ListOrdersQuery,
  OrderStatus,
  PaginatedResponse,
} from '@notifyhub/shared';
import { apiClient } from '@/lib/api-client';
import type { Order } from '@/types/domain';

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders', input);
  return data.data;
}

export async function listOrders(query: ListOrdersQuery): Promise<PaginatedResponse<Order>> {
  const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders', { params: query });
  return data;
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return data.data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  return data.data;
}
