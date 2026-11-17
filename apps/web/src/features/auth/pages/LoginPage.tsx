import { Box, Link, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useLocation } from 'react-router';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLogin } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { getErrorMessage } from '@/utils/get-error-message';

function getRedirectPath(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  ) {
    return state.from;
  }
  return '/products';
}

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const login = useLogin();

  if (user) return <Navigate to={getRedirectPath(location.state)} replace />;

  return (
    <AuthShell
      eyebrow="YENİDEN HOŞ GELDİN"
      title="Güzel seçimlerin seni bekliyor."
      description="Hesabına giriş yap, siparişlerini takip et ve alışverişine kaldığın yerden devam et."
      footer={
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Henüz hesabın yok mu?{' '}
          <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 800 }}>
            Hemen oluştur
          </Link>
        </Typography>
      }
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Giriş yap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Bilgilerini girerek hesabına güvenle devam et.
        </Typography>
      </Box>
      <LoginForm
        isSubmitting={login.isPending}
        errorMessage={login.isError ? getErrorMessage(login.error) : null}
        onSubmit={(values) => login.mutate(values)}
      />
    </AuthShell>
  );
}
