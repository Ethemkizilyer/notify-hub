import { Alert, Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
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

  if (items.length === 0) return <Typography>Sepetin boş.</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sepet
      </Typography>
      <Stack spacing={2}>
        {items.map((item) => (
          <Paper
            key={item.productId}
            variant="outlined"
            sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(item.priceCents)}
              </Typography>
            </Box>
            <TextField
              type="number"
              size="small"
              label="Adet"
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1, max: MAX_QUANTITY } }}
              sx={{ width: 100 }}
            />
            <IconButton aria-label="Kaldır" onClick={() => removeItem(item.productId)}>
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>

      <Typography variant="h5" sx={{ mt: 3 }}>
        Toplam: {formatPrice(total)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Tutar sipariş anında sunucuda veritabanı fiyatlarıyla yeniden hesaplanır.
      </Typography>

      {createOrder.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {getErrorMessage(createOrder.error)}
        </Alert>
      )}
      <Button
        variant="contained"
        size="large"
        sx={{ mt: 2 }}
        onClick={handleCheckout}
        disabled={createOrder.isPending}
      >
        Siparişi onayla
      </Button>
    </Box>
  );
}
