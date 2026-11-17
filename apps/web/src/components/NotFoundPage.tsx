import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 10 }}>
      <Typography variant="h4">Sayfa bulunamadı</Typography>
      <Button component={Link} to="/products" variant="contained">
        Ürünlere dön
      </Button>
    </Stack>
  );
}
