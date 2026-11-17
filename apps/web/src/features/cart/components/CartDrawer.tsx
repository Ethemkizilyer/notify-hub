import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link as RouterLink } from 'react-router';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/format-price';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 410 },
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}
      >
        <Box>
          <Typography variant="overline" color="primary.main">
            SEÇİMLERİN
          </Typography>
          <Typography variant="h5">Sepetim ({itemCount})</Typography>
        </Box>
        <IconButton aria-label="Sepeti kapat" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider />

      {items.length === 0 ? (
        <Stack
          spacing={1.25}
          sx={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 62,
              height: 62,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 4,
              color: 'primary.main',
              bgcolor: 'action.hover',
            }}
          >
            <ShoppingCartOutlinedIcon />
          </Box>
          <Typography variant="h6">Sepetin boş</Typography>
          <Typography variant="body2" color="text.secondary">
            Güzel seçimlerini eklediğinde burada göreceksin.
          </Typography>
          <Button component={RouterLink} to="/products" onClick={onClose} variant="contained">
            Ürünleri keşfet
          </Button>
        </Stack>
      ) : (
        <>
          <Stack spacing={1.25} sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
            {items.map((item) => (
              <Stack
                key={item.productId}
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 2.5,
                    color: 'primary.main',
                    bgcolor: 'action.hover',
                    flexShrink: 0,
                  }}
                >
                  <Inventory2OutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} × {formatPrice(item.priceCents)}
                  </Typography>
                </Box>
                <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  <Typography variant="subtitle2">
                    {formatPrice(item.quantity * item.priceCents)}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={`${item.name} ürününü kaldır`}
                    onClick={() => removeItem(item.productId)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary">Ara toplam</Typography>
              <Typography variant="h6">{formatPrice(total)}</Typography>
            </Stack>
            <Button
              component={RouterLink}
              to="/cart"
              onClick={onClose}
              variant="contained"
              fullWidth
              size="large"
            >
              Sepeti görüntüle
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
