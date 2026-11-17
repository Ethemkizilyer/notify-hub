import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { registerSchema, type RegisterInput } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import { AuthShell } from '@/features/auth/components/AuthShell';
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
    <AuthShell
      eyebrow="KENDİNE BİR İYİLİK YAP"
      title="Alışverişin daha kolay hali."
      description="Ücretsiz hesabını oluştur. Siparişlerini tek yerden yönet, her güncellemeyi anında öğren."
      footer={
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Zaten hesabın var mı?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 800 }}>
            Giriş yap
          </Link>
        </Typography>
      }
    >
      <Stack spacing={0.75} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hesap oluştur
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Birkaç bilgiyle hemen başlayabilirsin.
        </Typography>
      </Stack>
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      >
        <TextField
          label="Ad soyad"
          autoComplete="name"
          placeholder="Adın ve soyadın"
          {...register('fullName')}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          slotProps={{
            input: {
              startAdornment: (
                <PersonOutlineRoundedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              ),
            },
          }}
        />
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
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message || 'Harf ve rakam içeren güçlü bir şifre seç.'}
          slotProps={{
            input: {
              startAdornment: (
                <LockOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              ),
            },
          }}
        />
        {signUp.isError && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {getErrorMessage(signUp.error)}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={signUp.isPending}
          sx={{ mt: 0.5, py: 1.45 }}
        >
          {signUp.isPending ? 'Hesabın oluşturuluyor…' : 'Ücretsiz hesap oluştur'}
        </Button>
      </Stack>
    </AuthShell>
  );
}
