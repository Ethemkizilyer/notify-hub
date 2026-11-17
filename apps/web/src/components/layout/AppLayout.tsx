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
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useNotificationSocket } from '@/features/notifications/hooks/use-notifications';
import { logout } from '@/features/auth/api/auth.api';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUiStore } from '@/stores/ui.store';

type NavItemProps = {
  to: string;
  label: string;
  active: boolean;
};

function NavItem({ to, label, active }: NavItemProps) {
  return (
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      sx={{
        minHeight: 42,
        px: 1.5,
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'rgba(36, 92, 72, 0.08)' : 'transparent',
        fontSize: '0.84rem',
        '&:hover': { bgcolor: 'rgba(36, 92, 72, 0.08)', color: 'primary.main' },
      }}
    >
      {label}
    </Button>
  );
}

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const mode = useUiStore((state) => state.mode);
  const toggleMode = useUiStore((state) => state.toggleMode);
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  useNotificationSocket((event) => setToast(event.title));

  async function handleLogout() {
    await logout().catch(() => undefined);
    useAuthStore.getState().clear();
    queryClient.clear();
    void navigate('/login');
  }

  const navItems = [
    { to: '/products', label: 'Keşfet', active: location.pathname.startsWith('/products') },
    ...(user
      ? [{ to: '/orders', label: 'Siparişlerim', active: location.pathname === '/orders' }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          {
            to: '/admin/products',
            label: 'Ürün yönetimi',
            active: location.pathname === '/admin/products',
          },
          {
            to: '/admin/orders',
            label: 'Sipariş yönetimi',
            active: location.pathname === '/admin/orders',
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          py: 0.75,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
          Güzel seçimler, kolay siparişler — NotifyHub ile her şey kontrolünde
        </Typography>
      </Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: 'text.primary',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 82 }, gap: { xs: 1, md: 3 } }}>
            <Stack
              component={RouterLink}
              to="/products"
              direction="row"
              spacing={1.2}
              sx={{
                alignItems: 'center',
                textDecoration: 'none',
                color: 'text.primary',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '15px 15px 15px 5px',
                  color: 'primary.contrastText',
                  bgcolor: 'primary.main',
                  transform: 'rotate(-5deg)',
                  '& svg': { transform: 'rotate(5deg)', fontSize: 23 },
                }}
              >
                <ShoppingBagOutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.08rem', lineHeight: 1.1 }}>
                  notify<span style={{ color: '#c46f4d' }}>hub</span>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' }, letterSpacing: '0.03em' }}
                >
                  siparişin, kontrolünde
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ ml: 3, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
            >
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />
            {user && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', lg: 'block' }, mr: 0.5 }}
              >
                Merhaba,{' '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                  {user.fullName.split(' ')[0]}
                </Box>
              </Typography>
            )}
            <Tooltip title={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}>
              <IconButton
                aria-label="Temayı değiştir"
                onClick={toggleMode}
                sx={{ color: 'text.secondary' }}
              >
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            {user ? (
              <>
                <Tooltip title="Sepetim">
                  <IconButton
                    aria-label="Sepetim"
                    component={RouterLink}
                    to="/cart"
                    sx={{ color: 'text.primary' }}
                  >
                    <Badge badgeContent={cartCount} color="secondary" max={99}>
                      <ShoppingCartOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <NotificationBell />
                <Tooltip title="Oturumu kapat">
                  <IconButton
                    aria-label="Çıkış yap"
                    onClick={() => void handleLogout()}
                    sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    <LogoutOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Button component={RouterLink} to="/login" color="inherit">
                  Giriş yap
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" size="small">
                  Hesap oluştur
                </Button>
              </Stack>
            )}
          </Toolbar>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: 'flex', md: 'none' },
              overflowX: 'auto',
              pb: 1.25,
              mx: -1,
              px: 1,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
            {!user && (
              <>
                <NavItem to="/login" label="Giriş yap" active={location.pathname === '/login'} />
                <NavItem
                  to="/register"
                  label="Hesap oluştur"
                  active={location.pathname === '/register'}
                />
              </>
            )}
            {user && (
              <Button
                onClick={() => void handleLogout()}
                sx={{ minHeight: 42, px: 1.5, color: 'text.secondary', fontSize: '0.84rem' }}
              >
                Çıkış yap
              </Button>
            )}
          </Stack>
        </Container>
      </AppBar>

      <Container
        component="main"
        maxWidth="xl"
        className="page-enter"
        sx={{ py: { xs: 3, md: 5 }, flex: 1, width: '100%' }}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Container
          maxWidth="xl"
          sx={{
            minHeight: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} NotifyHub · İyi alışverişler.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Güvenli sipariş · Anlık bilgilendirme
          </Typography>
        </Container>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 3 }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
