import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { createProductSchema, type CreateProductFormValues } from '@notifyhub/shared';
import { useForm } from 'react-hook-form';
import {
  useCreateProduct,
  useDeactivateProduct,
  useProducts,
} from '@/features/products/hooks/use-products';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

export function AdminProductsPage() {
  const products = useProducts({ page: 1, limit: 100, sort: 'createdAt', order: 'desc' });
  const createProduct = useCreateProduct();
  const deactivate = useDeactivateProduct();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ürün yönetimi
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 4, maxWidth: 560 }}>
        <Typography variant="h6">Yeni ürün</Typography>
        <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <TextField
            label="Ad"
            fullWidth
            margin="normal"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Açıklama"
            fullWidth
            margin="normal"
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            label="Fiyat (kuruş)"
            type="number"
            fullWidth
            margin="normal"
            {...register('priceCents', { valueAsNumber: true })}
            error={!!errors.priceCents}
            helperText={errors.priceCents?.message}
          />
          <TextField
            label="Stok"
            type="number"
            fullWidth
            margin="normal"
            {...register('stock', { valueAsNumber: true })}
            error={!!errors.stock}
            helperText={errors.stock?.message}
          />
          {createProduct.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(createProduct.error)}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={createProduct.isPending}
          >
            Ürünü ekle
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Aktif ürünler
      </Typography>
      {deactivate.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(deactivate.error)}
        </Alert>
      )}
      <Stack spacing={1}>
        {products.data?.data.map((product) => (
          <Paper
            key={product.id}
            variant="outlined"
            sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(product.priceCents)} · Stok: {product.stock}
              </Typography>
            </Box>
            <Button
              color="error"
              size="small"
              onClick={() => deactivate.mutate(product.id)}
              disabled={deactivate.isPending}
            >
              Pasifleştir
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
