import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { loginSchema, type LoginInput } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';

type LoginFormProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: LoginInput) => void;
};

export function LoginForm({ isSubmitting, errorMessage, onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
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
      {errorMessage && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {errorMessage}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isSubmitting}
        sx={{ mt: 0.5, py: 1.45 }}
      >
        {isSubmitting ? 'Hesabın açılıyor…' : 'Güvenle giriş yap'}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        Devam ederek NotifyHub kullanım koşullarını kabul etmiş olursun.
      </Typography>
    </Stack>
  );
}
