import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '54vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 480 }}>
        <Box
          sx={{
            width: 90,
            height: 90,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '30px 30px 30px 8px',
            color: 'primary.main',
            bgcolor: 'rgba(36, 92, 72, 0.09)',
            transform: 'rotate(-5deg)',
            '& svg': { fontSize: 42, transform: 'rotate(5deg)' },
          }}
        >
          <ExploreOutlinedIcon />
        </Box>
        <Typography variant="h1" color="primary.main" sx={{ fontSize: { xs: '4rem', sm: '5rem' } }}>
          404
        </Typography>
        <Typography variant="h4">Bu sayfayı bulamadık.</Typography>
        <Typography color="text.secondary">
          Aradığın sayfa taşınmış ya da artık burada olmayabilir. Keşfe geri dönelim.
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mt: 1 }}
        >
          Ürünlere dön
        </Button>
      </Stack>
    </Box>
  );
}
