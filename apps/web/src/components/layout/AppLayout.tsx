import { useState } from 'react';
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useNotificationSocket } from '@/features/notifications/hooks/use-notifications';
import { logout } from '@/features/auth/api/auth.api';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const mode = useUiStore((state) => state.mode);
  const toggleMode = useUiStore((state) => state.toggleMode);
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  useNotificationSocket((event) => setToast(event.title));

  async function handleLogout() {
    await logout().catch(() => undefined);
    useAuthStore.getState().clear();
    queryClient.clear();
    void navigate('/login');
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/products"
            sx={{ color: 'inherit', textDecoration: 'none', mr: 2 }}
          >
            NotifyHub
          </Typography>
          <Button color="inherit" component={RouterLink} to="/products">
            Ürünler
          </Button>
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/orders">
                Siparişlerim
              </Button>
              {user.role === 'ADMIN' && (
                <>
                  <Button color="inherit" component={RouterLink} to="/admin/products">
                    Ürün yönetimi
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/admin/orders">
                    Sipariş yönetimi
                  </Button>
                </>
              )}
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" aria-label="Tema değiştir" onClick={toggleMode}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          {user ? (
            <>
              <IconButton color="inherit" aria-label="Sepet" component={RouterLink} to="/cart">
                <Badge badgeContent={cartCount} color="secondary" max={99}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <NotificationBell />
              <IconButton
                color="inherit"
                aria-label="Çıkış yap"
                onClick={() => void handleLogout()}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Giriş
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Kayıt
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
