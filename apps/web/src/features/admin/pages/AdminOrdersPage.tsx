import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { ORDER_STATUSES, type OrderStatus } from '@notifyhub/shared';
import { EmptyState } from '@/components/EmptyState';
import { PageHeading } from '@/components/PageHeading';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/use-orders';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim edildi',
  CANCELLED: 'İptal edildi',
};

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, limit: PAGE_SIZE });
  const updateStatus = useUpdateOrderStatus();

  return (
    <Box>
      <PageHeading
        eyebrow="YÖNETİM PANELİ / OPERASYON"
        title="Siparişler"
        description="Gelen siparişleri incele ve durum güncellemelerini müşterilere anında ilet."
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
      {updateStatus.isError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {getErrorMessage(updateStatus.error)}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            p: 2.5,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6">Tüm siparişler</Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.data?.meta.total ?? 0} kayıt
            </Typography>
          </Box>
          <Chip
            size="small"
            variant="outlined"
            label={orders.isFetching && !orders.isLoading ? 'Güncelleniyor' : 'Canlı operasyon'}
            color={orders.isFetching && !orders.isLoading ? 'default' : 'success'}
          />
        </Stack>

        {orders.isLoading ? (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} height={58} />
            ))}
          </Stack>
        ) : orders.data?.data.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState
              icon={<LocalShippingOutlinedIcon />}
              title="Henüz sipariş gelmedi"
              description="Müşteriler sipariş verdiğinde kayıtlar burada görünecek."
            />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Sipariş</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.data?.data.map((order) => {
                  const name = order.user?.fullName ?? 'Müşteri';
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.items.length} ürün
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              color: 'primary.main',
                              bgcolor: 'rgba(36, 92, 72, 0.1)',
                            }}
                          >
                            {name.slice(0, 1).toLocaleUpperCase('tr-TR')}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">{formatPrice(order.totalCents)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={order.status}
                          disabled={updateStatus.isPending}
                          onChange={(event) => {
                            const next = event.target.value;
                            if (isOrderStatus(next)) {
                              updateStatus.mutate({ id: order.id, status: next });
                            }
                          }}
                          sx={{ minWidth: 150, fontSize: '0.82rem' }}
                          inputProps={{ 'aria-label': `${name} sipariş durumu` }}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <MenuItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {orders.data && orders.data.meta.totalPages > 1 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              px: 2.5,
              py: 1.75,
              borderTop: 1,
              borderColor: 'divider',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sayfa {page} / {orders.data.meta.totalPages}
            </Typography>
            <Pagination
              count={orders.data.meta.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
