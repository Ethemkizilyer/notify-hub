import { useState } from 'react';
import { Alert, Box, Button, Chip, Pagination, Paper, Stack, Typography } from '@mui/material';
import type { OrderStatus } from '@notifyhub/shared';
import { useCancelOrder, useOrders } from '@/features/orders/hooks/use-orders';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<OrderStatus, 'default' | 'info' | 'primary' | 'success' | 'error'> = {
  PENDING: 'default',
  CONFIRMED: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, limit: PAGE_SIZE });
  const cancel = useCancelOrder();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Siparişlerim
      </Typography>

      {orders.isError && <Alert severity="error">{getErrorMessage(orders.error)}</Alert>}
      {cancel.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(cancel.error)}
        </Alert>
      )}
      {orders.data?.data.length === 0 && <Typography>Henüz siparişin yok.</Typography>}

      <Stack spacing={2}>
        {orders.data?.data.map((order) => (
          <Paper key={order.id} variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="subtitle1">
                {new Date(order.createdAt).toLocaleString('tr-TR')}
              </Typography>
              <Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {order.items
                .map((item) => `${item.product?.name ?? item.productId} x${item.quantity}`)
                .join(', ')}
            </Typography>
            <Stack
              direction="row"
              sx={{ mt: 1, justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h6">{formatPrice(order.totalCents)}</Typography>
              {order.status === 'PENDING' && (
                <Button
                  color="error"
                  size="small"
                  onClick={() => cancel.mutate(order.id)}
                  disabled={cancel.isPending}
                >
                  İptal et
                </Button>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>

      {orders.data && orders.data.meta.totalPages > 1 && (
        <Pagination
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
          count={orders.data.meta.totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      )}
    </Box>
  );
}
