import { useState } from 'react';
import { Badge, Box, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/features/notifications/hooks/use-notifications';

export function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const unread = useUnreadCount();
  const notifications = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Bildirimler"
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <Badge badgeContent={unread.data ?? 0} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {notifications.data?.data.length === 0 && <MenuItem disabled>Bildirim yok</MenuItem>}
        {notifications.data?.data.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => markAsRead.mutate(notification.id)}
            sx={{
              whiteSpace: 'normal',
              maxWidth: 320,
              fontWeight: notification.readAt ? 400 : 700,
            }}
          >
            <Box>
              <Typography variant="subtitle2">{notification.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => markAllAsRead.mutate()}>Tümünü okundu say</MenuItem>
      </Menu>
    </>
  );
}
