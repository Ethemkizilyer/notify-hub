import { useState } from 'react';
import { Alert, Box, MenuItem, Pagination, Paper, Select, Stack, Typography } from '@mui/material';
import { ORDER_STATUSES, type OrderStatus } from '@notifyhub/shared';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/use-orders';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 10;

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, limit: PAGE_SIZE });
  const updateStatus = useUpdateOrderStatus();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sipariş yönetimi
      </Typography>

      {orders.isError && <Alert severity="error">{getErrorMessage(orders.error)}</Alert>}
      {updateStatus.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(updateStatus.error)}
        </Alert>
      )}

      <Stack spacing={2}>
        {orders.data?.data.map((order) => (
          <Paper key={order.id} variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Box>
                <Typography variant="subtitle1">{order.user?.fullName ?? order.userId}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.createdAt).toLocaleString('tr-TR')} ·{' '}
                  {formatPrice(order.totalCents)}
                </Typography>
              </Box>
              <Select
                size="small"
                value={order.status}
                disabled={updateStatus.isPending}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isOrderStatus(next)) updateStatus.mutate({ id: order.id, status: next });
                }}
                sx={{ minWidth: 180 }}
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
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
