import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { loginSchema, type LoginInput } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useLocation } from 'react-router';
import { AuthShell } from '@/features/auth/components/AuthShell';
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={(event) => void handleSubmit((values) => login.mutate(values))(event)}
      >
        <TextField
          label="E-posta adresi"
          type="email"
          autoComplete="email"
          placeholder="ornek@eposta.com"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          slotProps={{
            input: {
              startAdornment: (
                <EmailOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              ),
            },
          }}
        />
        <TextField
          label="Şifre"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              startAdornment: (
                <LockOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              ),
            },
          }}
        />
        {login.isError && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {getErrorMessage(login.error)}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={login.isPending}
          sx={{ mt: 0.5, py: 1.45 }}
        >
          {login.isPending ? 'Hesabın açılıyor…' : 'Güvenle giriş yap'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Devam ederek NotifyHub kullanım koşullarını kabul etmiş olursun.
        </Typography>
      </Stack>
    </AuthShell>
  );
}
