import { useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Link as RouterLink, useParams } from 'react-router';
import { productIdParamsSchema } from '@notifyhub/shared';
import { useProduct } from '@/features/products/hooks/use-products';
import { ProductArtwork } from '@/features/products/components/ProductArtwork';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';
import { NotFoundPage } from '@/components/NotFoundPage';

export function ProductDetailPage() {
  const { id } = useParams();
  const parsedParams = productIdParamsSchema.safeParse({ id });
  const productId = parsedParams.success ? parsedParams.data.id : '';
  const product = useProduct(productId);
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  if (!parsedParams.success) return <NotFoundPage />;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }} aria-label="Breadcrumb">
        <Link component={RouterLink} to="/products" underline="hover" color="text.secondary">
          Keşfet
        </Link>
        <Typography color="text.primary">Ürün detayı</Typography>
      </Breadcrumbs>

      {product.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void product.refetch()}>
              Tekrar dene
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {getErrorMessage(product.error)}
        </Alert>
      )}

      {product.isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 3, md: 6 },
          }}
        >
          <Skeleton variant="rounded" height={440} sx={{ borderRadius: 6 }} />
          <Stack spacing={2}>
            <Skeleton width="35%" />
            <Skeleton width="80%" height={58} />
            <Skeleton width="55%" height={44} />
            <Skeleton width="100%" height={100} />
            <Skeleton width="45%" height={55} />
          </Stack>
        </Box>
      ) : product.isError ? null : product.data ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 3, md: 6 },
            alignItems: 'center',
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.25, sm: 2 },
              borderRadius: { xs: 5, md: 7 },
              bgcolor: 'background.paper',
            }}
          >
            <ProductArtwork seed={product.data.id} height={440} />
          </Paper>
          <Stack spacing={2.25} sx={{ py: { md: 3 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={product.data.stock > 0 ? 'Stokta mevcut' : 'Stokta yok'}
                color={product.data.stock > 0 ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {product.data.stock > 0 ? `${product.data.stock} adet hazır` : 'Yakında tekrar'}
              </Typography>
            </Stack>
            <Typography
              variant="h1"
              component="h1"
              sx={{ fontSize: { xs: '2.5rem', sm: '3.4rem', lg: '4rem' }, lineHeight: 1.05 }}
            >
              {product.data.name}
            </Typography>
            <Typography variant="h4" color="primary.main">
              {formatPrice(product.data.priceCents)}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.9, maxWidth: 540 }}>
              {product.data.description ||
                'Günlük hayatına iyi gelecek, özenle seçilmiş bir ürün. Siparişini oluşturduğunda tüm güncellemeleri anında takip edebilirsin.'}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(36, 92, 72, 0.045)',
                maxWidth: 480,
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <CheckCircleOutlineRoundedIcon color="success" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2">Sipariş boyunca haberdar ol</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    Durum değiştiğinde sana anında bildirim göndeririz.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {added && (
              <Alert severity="success" sx={{ maxWidth: 480, borderRadius: 3 }}>
                Ürün sepetine eklendi.
              </Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ maxWidth: 480 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AddShoppingCartOutlinedIcon />}
                disabled={product.data.stock === 0}
                onClick={() => {
                  addItem({
                    productId: product.data.id,
                    name: product.data.name,
                    priceCents: product.data.priceCents,
                  });
                  setAdded(true);
                }}
                sx={{ py: 1.5 }}
              >
                Sepete ekle
              </Button>
              <Button
                component={RouterLink}
                to="/products"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ flexShrink: 0, py: 1.5 }}
              >
                Ürünlere dön
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Bu ürün bulunamadı veya satışta değil.{' '}
          <Link component={RouterLink} to="/products">
            Ürünlere geri dön
          </Link>
        </Alert>
      )}
    </Box>
  );
}
