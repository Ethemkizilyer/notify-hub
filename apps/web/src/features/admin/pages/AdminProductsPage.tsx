import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import {
  createProductSchema,
  type CreateProductFormValues,
  type UpdateProductInput,
} from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import { EmptyState } from '@/components/EmptyState';
import { PageHeading } from '@/components/PageHeading';
import { ProductEditDialog } from '@/features/admin/components/ProductEditDialog';
import {
  useCreateProduct,
  useDeactivateProduct,
  useProducts,
  useUpdateProduct,
} from '@/features/products/hooks/use-products';
import type { Product } from '@/types/domain';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';
import { Pagination } from '@mui/material';

const PAGE_SIZE = 8;

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const products = useProducts({ page, limit: PAGE_SIZE, sort: 'createdAt', order: 'desc' });
  const createProduct = useCreateProduct();
  const deactivate = useDeactivateProduct();
  const updateProduct = useUpdateProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', description: '', priceCents: 0, stock: 0 },
  });

  const onSubmit = (values: CreateProductFormValues) =>
    createProduct.mutate(createProductSchema.parse(values), { onSuccess: () => reset() });

  function handleUpdate(id: string, input: UpdateProductInput) {
    updateProduct.mutate({ id, input }, { onSuccess: () => setEditingProduct(null) });
  }

  return (
    <Box>
      <PageHeading
        eyebrow="YÖNETİM PANELİ / KATALOG"
        title="Ürünler"
        description="Kataloğunu düzenle, stokları takip et ve yeni ürünler ekle."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(300px, 0.75fr)' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
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
              <Typography variant="h6">Katalog</Typography>
              <Typography variant="body2" color="text.secondary">
                {products.data?.meta.total ?? 0} ürün kayıtlı
              </Typography>
            </Box>
            {products.isFetching && !products.isLoading && (
              <Chip size="small" label="Güncelleniyor" variant="outlined" />
            )}
          </Stack>
          {products.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void products.refetch()}>
                  Tekrar dene
                </Button>
              }
              sx={{ m: 2 }}
            >
              {getErrorMessage(products.error)}
            </Alert>
          )}
          {products.isLoading ? (
            <Stack spacing={1} sx={{ p: 2.5 }}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} height={54} />
              ))}
            </Stack>
          ) : products.data?.data.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <EmptyState
                icon={<Inventory2OutlinedIcon />}
                title="Katalog henüz boş"
                description="Sağdaki formdan ilk ürününü ekleyerek kataloğunu oluşturmaya başla."
              />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="right">Fiyat</TableCell>
                    <TableCell align="right">Stok</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.data?.data.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: 2.5,
                              color: 'primary.main',
                              bgcolor: 'rgba(36, 92, 72, 0.08)',
                            }}
                          >
                            <Inventory2OutlinedIcon fontSize="small" />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220 }}>
                              {product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: 'block', maxWidth: 220 }}
                            >
                              {product.description || 'Açıklama eklenmemiş'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">
                          {formatPrice(product.priceCents)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}
                          color={product.stock > 0 ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label={`${product.name} ürününü düzenle`}
                          onClick={() => {
                            updateProduct.reset();
                            setEditingProduct(product);
                          }}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => deactivate.mutate(product.id)}
                          disabled={deactivate.isPending}
                        >
                          Pasifleştir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {products.data && products.data.meta.totalPages > 1 && (
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
                Sayfa {page} / {products.data.meta.totalPages}
              </Typography>
              <Pagination
                count={products.data.meta.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                size="small"
                shape="rounded"
              />
            </Stack>
          )}
          {deactivate.isError && (
            <Alert severity="error" sx={{ m: 2 }}>
              {getErrorMessage(deactivate.error)}
            </Alert>
          )}
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 5,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              color: 'primary.main',
              bgcolor: 'rgba(36, 92, 72, 0.09)',
              mb: 2,
            }}
          >
            <AddRoundedIcon />
          </Box>
          <Typography variant="h5">Yeni ürün ekle</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
            Ürün bilgilerini girerek kataloğuna ekle.
          </Typography>
          <Stack
            component="form"
            spacing={1.75}
            noValidate
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          >
            <TextField
              label="Ürün adı"
              placeholder="Örn. Seramik kahve fincanı"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Açıklama"
              placeholder="Ürünü kısaca tanıt"
              multiline
              minRows={3}
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              label="Fiyat (TL)"
              type="number"
              placeholder="149.90"
              {...register('priceCents', {
                setValueAs: (value: unknown) => Math.round(Number(value) * 100),
              })}
              error={!!errors.priceCents}
              helperText={errors.priceCents?.message || 'Örn. 149,90'}
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            />
            <TextField
              label="Stok adedi"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              error={!!errors.stock}
              helperText={errors.stock?.message}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            {createProduct.isError && (
              <Alert severity="error">{getErrorMessage(createProduct.error)}</Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={createProduct.isPending}
              startIcon={<AddRoundedIcon />}
            >
              {createProduct.isPending ? 'Ekleniyor…' : 'Ürünü kataloğa ekle'}
            </Button>
          </Stack>
        </Paper>
      </Box>

      <ProductEditDialog
        product={editingProduct}
        isPending={updateProduct.isPending}
        error={updateProduct.error}
        onClose={() => {
          if (!updateProduct.isPending) setEditingProduct(null);
        }}
        onSubmit={handleUpdate}
      />
    </Box>
  );
}
