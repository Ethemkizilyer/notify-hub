import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Paper, TextField, Typography } from '@mui/material';
import { loginSchema, type LoginInput } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useLocation } from 'react-router';
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
    <Paper sx={{ maxWidth: 420, mx: 'auto', p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Giriş yap
      </Typography>
      <Box
        component="form"
        noValidate
        onSubmit={(event) => void handleSubmit((values) => login.mutate(values))(event)}
      >
        <TextField
          label="E-posta"
          type="email"
          fullWidth
          margin="normal"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Şifre"
          type="password"
          fullWidth
          margin="normal"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        {login.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(login.error)}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={login.isPending}
        >
          Giriş yap
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Hesabın yok mu?{' '}
        <Link component={RouterLink} to="/register">
          Kayıt ol
        </Link>
      </Typography>
    </Paper>
  );
}
