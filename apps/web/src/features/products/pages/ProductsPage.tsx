import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Pagination,
  TextField,
  Typography,
} from '@mui/material';
import type { ListProductsQuery } from '@notifyhub/shared';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const query: ListProductsQuery = {
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    sort: 'createdAt',
    order: 'desc',
  };
  const products = useProducts(query);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ürünler
      </Typography>
      <TextField
        label="Ürün ara"
        fullWidth
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {products.isError && <Alert severity="error">{getErrorMessage(products.error)}</Alert>}
      {products.data?.data.length === 0 && <Typography>Ürün bulunamadı.</Typography>}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
        {products.data?.data.map((product) => (
          <Card key={product.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                {product.description ?? ''}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                {formatPrice(product.priceCents)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Stok: {product.stock}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                disabled={product.stock === 0}
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    priceCents: product.priceCents,
                  })
                }
              >
                {product.stock === 0 ? 'Tükendi' : 'Sepete ekle'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {products.data && products.data.meta.totalPages > 1 && (
        <Pagination
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
          count={products.data.meta.totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      )}
    </Box>
  );
}
