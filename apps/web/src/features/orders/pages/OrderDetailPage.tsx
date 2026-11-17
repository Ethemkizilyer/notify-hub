import { useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Link as RouterLink, useParams } from 'react-router';
import { orderIdParamsSchema, type OrderStatus } from '@notifyhub/shared';
import { PageHeading } from '@/components/PageHeading';
import { useCancelOrder, useOrder } from '@/features/orders/hooks/use-orders';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim edildi',
  CANCELLED: 'İptal edildi',
};
const DELIVERY_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export function OrderDetailPage() {
  const { id } = useParams();
  const parsedParams = orderIdParamsSchema.safeParse({ id });
  const orderId = parsedParams.success ? parsedParams.data.id : '';
  const order = useOrder(orderId);
  const cancel = useCancelOrder();
  const [cancelled, setCancelled] = useState(false);

  if (!parsedParams.success) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Sipariş numarası geçersiz.
        </Alert>
        <Button
          component={RouterLink}
          to="/orders"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mt: 2 }}
        >
          Siparişlerime dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }} aria-label="Breadcrumb">
        <Link component={RouterLink} to="/orders" underline="hover" color="text.secondary">
          Siparişlerim
        </Link>
        <Typography color="text.primary">Sipariş detayı</Typography>
      </Breadcrumbs>

      {order.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void order.refetch()}>
              Tekrar dene
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {getErrorMessage(order.error)}
        </Alert>
      )}
      {cancel.isError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {getErrorMessage(cancel.error)}
        </Alert>
      )}
      {cancelled && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 3 }}>
          Siparişin iptal edildi, stok bilgisi güncellendi.
        </Alert>
      )}

      {order.isLoading ? (
        <Stack spacing={2}>
          <Skeleton width="40%" height={48} />
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: 5 }} />
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: 5 }} />
        </Stack>
      ) : order.isError ? null : order.data ? (
        <Stack spacing={2.5}>
          <PageHeading
            eyebrow="SİPARİŞ DETAYI"
            title={`#${order.data.id.slice(0, 8).toUpperCase()}`}
            description={`Oluşturulma tarihi: ${new Date(order.data.createdAt).toLocaleString('tr-TR')}`}
            action={
              <Chip
                label={STATUS_LABELS[order.data.status]}
                color={
                  order.data.status === 'DELIVERED'
                    ? 'success'
                    : order.data.status === 'CANCELLED'
                      ? 'error'
                      : 'primary'
                }
              />
            }
          />

          {order.data.status === 'CANCELLED' ? (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              Bu sipariş iptal edildi.
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <LocalShippingOutlinedIcon color="primary" />
                <Typography variant="h6">Sipariş durumu</Typography>
              </Stack>
              <Stepper
                activeStep={DELIVERY_STEPS.indexOf(order.data.status)}
                alternativeLabel
                sx={{ '& .MuiStepLabel-label': { fontSize: { xs: '0.65rem', sm: '0.8rem' } } }}
              >
                {DELIVERY_STEPS.map((status) => (
                  <Step
                    key={status}
                    completed={
                      DELIVERY_STEPS.indexOf(status) < DELIVERY_STEPS.indexOf(order.data.status)
                    }
                  >
                    <StepLabel>{STATUS_LABELS[status]}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(280px, 0.6fr)' },
              gap: 2.5,
              alignItems: 'start',
            }}
          >
            <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 5 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6">Siparişindeki ürünler</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {order.data.items.length} farklı ürün
                </Typography>
              </Box>
              <Divider />
              <Stack divider={<Divider flexItem />}>
                {order.data.items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          borderRadius: 3,
                          color: 'primary.main',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Inventory2OutlinedIcon />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                          {item.product?.name ?? 'Ürün'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(item.unitPriceCents)} × {item.quantity}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 5, position: { md: 'sticky' }, top: 110 }}
            >
              <Typography variant="h6">Ödeme özeti</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Ara toplam</Typography>
                  <Typography>{formatPrice(order.data.totalCents)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Kargo</Typography>
                  <Typography color="success.main">Ücretsiz</Typography>
                </Stack>
                <Divider />
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Toplam</Typography>
                  <Typography variant="h4" color="primary.main">
                    {formatPrice(order.data.totalCents)}
                  </Typography>
                </Stack>
              </Stack>
              {order.data.status === 'PENDING' && (
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  disabled={cancel.isPending}
                  onClick={() =>
                    cancel.mutate(order.data.id, {
                      onSuccess: () => {
                        setCancelled(true);
                      },
                    })
                  }
                  sx={{ mt: 2.5 }}
                >
                  Siparişi iptal et
                </Button>
              )}
            </Paper>
          </Box>

          <Button
            component={RouterLink}
            to="/orders"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Tüm siparişlerime dön
          </Button>
        </Stack>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Sipariş bulunamadı.{' '}
          <Link component={RouterLink} to="/orders">
            Siparişlerime geri dön
          </Link>
        </Alert>
      )}
    </Box>
  );
}
