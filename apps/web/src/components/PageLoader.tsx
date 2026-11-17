import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

export function PageLoader() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 58,
            height: 58,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '19px 19px 19px 7px',
            color: 'primary.contrastText',
            bgcolor: 'primary.main',
            boxShadow: '0 12px 30px rgba(36, 92, 72, 0.2)',
          }}
        >
          <ShoppingBagOutlinedIcon />
        </Box>
        <CircularProgress size={22} thickness={5} />
        <Typography variant="body2" color="text.secondary">
          NotifyHub hazırlanıyor…
        </Typography>
      </Stack>
    </Box>
  );
}
