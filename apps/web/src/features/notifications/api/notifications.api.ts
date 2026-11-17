import type { ApiResponse, PaginatedResponse } from '@notifyhub/shared';
import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/types/domain';

export async function listNotifications(limit: number): Promise<PaginatedResponse<Notification>> {
  const { data } = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
    params: { limit },
  });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
    '/notifications/unread-count',
  );
  return data.data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
