import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
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

  function handleRead(id: string) {
    markAsRead.mutate(id);
  }

  return (
    <>
      <IconButton
        aria-label={`Bildirimler, ${unread.data ?? 0} okunmamış`}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ color: 'text.secondary' }}
      >
        <Badge
          badgeContent={unread.data ?? 0}
          color="secondary"
          max={99}
          overlap="circular"
          sx={{ '& .MuiBadge-badge': { fontSize: '0.62rem', minWidth: 17, height: 17 } }}
        >
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 380 },
              maxWidth: 380,
              maxHeight: 470,
              mt: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 4,
              boxShadow: '0 20px 55px rgba(28, 43, 34, 0.16)',
            },
          },
        }}
      >
        <Box sx={{ px: 2.25, pt: 1.75, pb: 1.25 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Bildirimler
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unread.data ? `${unread.data} okunmamış bildirim` : 'Hepsi güncel'}
              </Typography>
            </Box>
            {!!unread.data && (
              <Button
                size="small"
                startIcon={<DoneAllRoundedIcon />}
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                Tümünü oku
              </Button>
            )}
          </Stack>
        </Box>
        <Divider />
        {notifications.isLoading ? (
          <MenuItem disabled sx={{ py: 2 }}>
            Bildirimler yükleniyor…
          </MenuItem>
        ) : notifications.data?.data.length === 0 ? (
          <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
            <NotificationsNoneRoundedIcon sx={{ color: 'text.disabled', fontSize: 30 }} />
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
              Şimdilik sakin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yeni gelişmeler burada görünecek.
            </Typography>
          </Box>
        ) : (
          notifications.data?.data.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleRead(notification.id)}
              sx={{
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                gap: 1.25,
                py: 1.5,
                px: 2.25,
                bgcolor: notification.readAt ? 'transparent' : 'rgba(36, 92, 72, 0.045)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  mt: 0.8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: notification.readAt ? 'transparent' : 'secondary.main',
                }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: notification.readAt ? 600 : 800 }}
                >
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: 'block', mt: 0.75 }}
                >
                  {new Date(notification.createdAt).toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
