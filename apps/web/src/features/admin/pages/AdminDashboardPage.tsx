import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import type { OrderStatus } from '@notifyhub/shared';
import { Link as RouterLink } from 'react-router';
import { PageHeading } from '@/components/PageHeading';
import { EmptyState } from '@/components/EmptyState';
import type { AdminDashboardStats } from '@/features/admin/api/dashboard.api';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin-dashboard';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim edildi',
  CANCELLED: 'İptal edildi',
};

const STATUS_COLORS: Record<
  OrderStatus,
  'default' | 'info' | 'primary' | 'success' | 'error' | 'warning'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const METRIC_PRESENTATION = [
  {
    key: 'orders',
    title: 'Toplam sipariş',
    value: (stats: AdminDashboardStats) => stats.totalOrders,
    icon: <ShoppingBagOutlinedIcon />,
    color: '#245c48',
  },
  {
    key: 'pending',
    title: 'Bekleyen',
    value: (stats: AdminDashboardStats) => stats.ordersByStatus.PENDING,
    icon: <TaskAltRoundedIcon />,
    color: '#b8792e',
  },
  {
    key: 'products',
    title: 'Aktif ürün',
    value: (stats: AdminDashboardStats) => stats.activeProducts,
    icon: <Inventory2OutlinedIcon />,
    color: '#527d8f',
  },
  {
    key: 'users',
    title: 'Kullanıcı hesabı',
    value: (stats: AdminDashboardStats) => stats.userAccounts,
    icon: <PeopleAltOutlinedIcon />,
    color: '#8a687f',
  },
];

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();

  return (
    <Box>
      <PageHeading
        eyebrow="YÖNETİM PANELİ / GENEL BAKIŞ"
        title="Günaydın, yönetici."
        description="Siparişlerin, katalog ve kullanıcı hareketlerinin güncel özeti."
        action={
          <Button component={RouterLink} to="/admin/orders" endIcon={<ArrowForwardRoundedIcon />}>
            Siparişleri yönet
          </Button>
        }
      />

      {dashboard.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void dashboard.refetch()}>
              Tekrar dene
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {getErrorMessage(dashboard.error)}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, 1fr)' },
          gap: { xs: 1.25, sm: 2 },
          mb: 3,
        }}
      >
        {METRIC_PRESENTATION.map((metric) => (
          <Paper
            key={metric.key}
            variant="outlined"
            sx={{
              p: { xs: 1.75, sm: 2.5 },
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 90,
                height: 90,
                right: -38,
                bottom: -45,
                borderRadius: '50%',
                bgcolor: `${metric.color}12`,
              },
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {metric.title}
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  width: 38,
                  height: 38,
                  color: metric.color,
                  bgcolor: `${metric.color}14`,
                }}
              >
                {metric.icon}
              </Avatar>
            </Stack>
            {dashboard.isLoading ? (
              <Skeleton width="40%" height={50} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
                {dashboard.data ? metric.value(dashboard.data) : '—'}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

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
            <Typography variant="h6">Son siparişler</Typography>
            <Typography variant="body2" color="text.secondary">
              En son gelen siparişlerin özeti
            </Typography>
          </Box>
          <Button component={RouterLink} to="/admin/orders" size="small">
            Tüm siparişler
          </Button>
        </Stack>

        {dashboard.isLoading ? (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} height={52} />
            ))}
          </Stack>
        ) : dashboard.data?.recentOrders.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState
              icon={<ShoppingBagOutlinedIcon />}
              title="Sipariş hareketi yok"
              description="Yeni siparişler oluşturuldukça bu alanda özetini göreceksin."
            />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
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
                {dashboard.data?.recentOrders.map((order) => {
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.user?.fullName ?? 'Müşteri'}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell align="right">{formatPrice(order.totalCents)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={STATUS_LABELS[order.status]}
                          color={STATUS_COLORS[order.status]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
