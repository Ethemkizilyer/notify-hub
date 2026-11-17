import { Alert, Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import { Link as RouterLink, useNavigate } from 'react-router';
import { EmptyState } from '@/components/EmptyState';
import { PageHeading } from '@/components/PageHeading';
import { useCreateOrder } from '@/features/orders/hooks/use-orders';
import { MAX_QUANTITY, useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clear);
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleCheckout() {
    createOrder.mutate(
      { items: items.map(({ productId, quantity }) => ({ productId, quantity })) },
      {
        onSuccess: () => {
          clearCart();
          void navigate('/orders');
        },
      },
    );
  }

  if (items.length === 0) {
    return (
      <Box>
        <PageHeading eyebrow="SEPETİM" title="Sepetin" description="Seçimlerin burada bir arada." />
        <EmptyState
          icon={<ShoppingCartCheckoutRoundedIcon />}
          title="Sepetin şimdilik boş"
          description="Kendine güzel bir şeyler bul. Beğendiğin ürünleri buraya ekleyebilirsin."
          actionLabel="Ürünleri keşfet"
          onAction={() => void navigate('/products')}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeading
        eyebrow="SEPETİM"
        title="Güzel seçimler."
        description={`${itemCount} ürün siparişine hazır. İstediğin adetleri buradan düzenleyebilirsin.`}
        action={
          <Button
            component={RouterLink}
            to="/products"
            startIcon={<ArrowBackRoundedIcon />}
            color="inherit"
          >
            Alışverişe devam et
          </Button>
        }
      />

      {createOrder.isError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {getErrorMessage(createOrder.error)}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.5fr) minmax(300px, 0.75fr)' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={1.25}>
          {items.map((item) => (
            <Paper
              key={item.productId}
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 4,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '54px minmax(0, 1fr) auto',
                  sm: '68px minmax(0, 1fr) auto auto',
                },
                gap: { xs: 1.25, sm: 2 },
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: { xs: 54, sm: 68 },
                  height: { xs: 58, sm: 72 },
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  color: 'primary.main',
                  bgcolor: 'rgba(36, 92, 72, 0.08)',
                }}
              >
                <Inventory2OutlinedIcon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {formatPrice(item.priceCents)} / adet
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  sx={{ mt: 0.75, display: { xs: 'block', sm: 'none' } }}
                >
                  {formatPrice(item.priceCents * item.quantity)}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.25}
                sx={{
                  alignItems: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2.5,
                }}
              >
                <IconButton
                  size="small"
                  aria-label={`${item.name} adedini azalt`}
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={item.quantity}
                  onChange={(event) => setQuantity(item.productId, Number(event.target.value) || 1)}
                  type="number"
                  aria-label={`${item.name} adedi`}
                  sx={{
                    width: 48,
                    '& .MuiOutlinedInput-root': { p: 0, bgcolor: 'transparent' },
                    '& fieldset': { border: 0 },
                    '& input': { p: '7px 0', textAlign: 'center', fontWeight: 700 },
                  }}
                  slotProps={{ htmlInput: { min: 1, max: MAX_QUANTITY } }}
                />
                <IconButton
                  size="small"
                  aria-label={`${item.name} adedini artır`}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= MAX_QUANTITY}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gridColumn: { xs: '2 / 4', sm: 'auto' },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 800 }}
                >
                  {formatPrice(item.priceCents * item.quantity)}
                </Typography>
                <IconButton
                  aria-label={`${item.name} ürününü sepetten kaldır`}
                  onClick={() => removeItem(item.productId)}
                  sx={{ color: 'text.secondary' }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 5,
            position: { lg: 'sticky' },
            top: 110,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h5">Sipariş özeti</Typography>
          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Ürünler ({itemCount})</Typography>
              <Typography>{formatPrice(total)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Kargo</Typography>
              <Typography color="success.main" sx={{ fontWeight: 700 }}>
                Ücretsiz
              </Typography>
            </Stack>
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <Typography sx={{ fontWeight: 700 }}>Toplam</Typography>
                <Typography variant="h4" color="primary.main">
                  {formatPrice(total)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Kesin tutar ve stok, sipariş anında sunucuda yeniden doğrulanır.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<ShoppingCartCheckoutRoundedIcon />}
            onClick={handleCheckout}
            disabled={createOrder.isPending}
            sx={{ mt: 2.5, py: 1.5 }}
          >
            {createOrder.isPending ? 'Sipariş oluşturuluyor…' : 'Siparişi tamamla'}
          </Button>
          <Button
            fullWidth
            color="inherit"
            onClick={clearCart}
            sx={{ mt: 0.75, color: 'text.secondary' }}
          >
            Sepeti temizle
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
