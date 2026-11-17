import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Paper, TextField, Typography } from '@mui/material';
import { registerSchema, type RegisterInput } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/utils/get-error-message';

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  const onSubmit = (values: RegisterInput) =>
    signUp.mutate(values, { onSuccess: () => void navigate('/login') });

  return (
    <Paper sx={{ maxWidth: 420, mx: 'auto', p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Kayıt ol
      </Typography>
      <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <TextField
          label="Ad soyad"
          fullWidth
          margin="normal"
          {...register('fullName')}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />
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
        {signUp.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(signUp.error)}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={signUp.isPending}
        >
          Kayıt ol
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Zaten hesabın var mı?{' '}
        <Link component={RouterLink} to="/login">
          Giriş yap
        </Link>
      </Typography>
    </Paper>
  );
}
