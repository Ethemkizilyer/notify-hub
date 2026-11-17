import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import type { OrderStatus } from '@notifyhub/shared';
import { EmptyState } from '@/components/EmptyState';
import { PageHeading } from '@/components/PageHeading';
import { Link as RouterLink } from 'react-router';
import { useCancelOrder, useOrders } from '@/features/orders/hooks/use-orders';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';
import { useNavigate } from 'react-router';

const PAGE_SIZE = 10;

const STATUS_PRESENTATION: Record<
  OrderStatus,
  { label: string; color: 'default' | 'info' | 'primary' | 'success' | 'error' | 'warning' }
> = {
  PENDING: { label: 'Beklemede', color: 'warning' },
  CONFIRMED: { label: 'Onaylandı', color: 'info' },
  SHIPPED: { label: 'Kargoda', color: 'primary' },
  DELIVERED: { label: 'Teslim edildi', color: 'success' },
  CANCELLED: { label: 'İptal edildi', color: 'error' },
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, limit: PAGE_SIZE });
  const cancel = useCancelOrder();

  return (
    <Box>
      <PageHeading
        eyebrow="SİPARİŞ MERKEZİ"
        title="Siparişlerim"
        description="Siparişlerinin durumunu takip et, geçmiş alışverişlerine göz at."
      />

      {orders.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void orders.refetch()}>
              Tekrar dene
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {getErrorMessage(orders.error)}
        </Alert>
      )}
      {cancel.isError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {getErrorMessage(cancel.error)}
        </Alert>
      )}

      {orders.isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }, (_, index) => (
            <Paper key={index} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
              <Skeleton width="30%" height={30} />
              <Skeleton width="75%" />
              <Skeleton width="45%" />
            </Paper>
          ))}
        </Stack>
      ) : orders.data?.data.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title="İlk siparişin seni bekliyor"
          description="Ürünlere göz at, beğendiklerini sepetine ekle. Siparişini buradan takip edebilirsin."
          actionLabel="Ürünleri keşfet"
          onAction={() => void navigate('/products')}
        />
      ) : (
        <Stack spacing={1.5}>
          {orders.data?.data.map((order) => {
            const status = STATUS_PRESENTATION[order.status];
            return (
              <Paper
                key={order.id}
                variant="outlined"
                sx={{
                  overflow: 'hidden',
                  borderRadius: 4,
                  transition: 'border-color 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 12px 30px rgba(34,48,38,0.06)',
                  },
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    p: { xs: 2, sm: 2.5 },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 3,
                        flexShrink: 0,
                        color: 'primary.main',
                        bgcolor: 'rgba(36, 92, 72, 0.08)',
                      }}
                    >
                      <Inventory2OutlinedIcon />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Sipariş #{order.id.slice(0, 8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {' · '}
                        {order.items.length} ürün
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minWidth: { sm: 245 },
                    }}
                  >
                    <Chip label={status.label} size="small" color={status.color} />
                    <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                      {formatPrice(order.totalCents)}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    px: { xs: 2, sm: 2.5 },
                    py: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    }}
                  >
                    {order.items
                      .map((item) => `${item.product?.name ?? 'Ürün'} × ${item.quantity}`)
                      .join('  ·  ')}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Button
                      component={RouterLink}
                      to={`/orders/${order.id}`}
                      size="small"
                      endIcon={<OpenInNewRoundedIcon />}
                    >
                      Detay
                    </Button>
                    {order.status === 'PENDING' && (
                      <Button
                        color="error"
                        size="small"
                        onClick={() => cancel.mutate(order.id)}
                        disabled={cancel.isPending}
                        endIcon={<ArrowForwardRoundedIcon />}
                      >
                        İptal et
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {orders.data && orders.data.meta.totalPages > 1 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mt: 3, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="body2" color="text.secondary">
            {orders.data.meta.total} sipariş · Sayfa {page} / {orders.data.meta.totalPages}
          </Typography>
          <Pagination
            count={orders.data.meta.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            shape="rounded"
            color="primary"
            siblingCount={0}
          />
        </Stack>
      )}
    </Box>
  );
}
