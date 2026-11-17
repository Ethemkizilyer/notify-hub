import { useEffect, useRef } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { NotificationType } from '@notifyhub/shared';
import { queryClient } from '@/lib/query-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';
import {
  getUnreadCount,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from '@/features/notifications/api/notifications.api';

export interface NotificationEvent {
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (limit: number) => ['notifications', 'list', limit] as const,
  unread: ['notifications', 'unread'] as const,
};

export function useNotifications(limit = 10) {
  return useQuery({
    queryKey: notificationKeys.list(limit),
    queryFn: () => listNotifications(limit),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadCount() {
  return useQuery({ queryKey: notificationKeys.unread, queryFn: getUnreadCount });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: markAsRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: markAllAsRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useNotificationSocket(onNotification: (event: NotificationEvent) => void) {
  const token = useAuthStore((state) => state.accessToken);
  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    socket.on('notification:new', (event: NotificationEvent) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      callbackRef.current(event);
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);
}
