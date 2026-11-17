import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { ListProductsQuery } from '@notifyhub/shared';
import { EmptyState } from '@/components/EmptyState';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/format-price';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 12;
const PRODUCT_ART = [
  { background: 'linear-gradient(145deg, #e9e7d9, #c9d5c4)', color: '#315b48' },
  { background: 'linear-gradient(145deg, #f4e3d3, #e5bca0)', color: '#955d42' },
  { background: 'linear-gradient(145deg, #dce8e5, #a7c9bd)', color: '#376b61' },
  { background: 'linear-gradient(145deg, #eee5ce, #dfc58f)', color: '#81652d' },
] as const;
type ProductSort = 'newest' | 'price-asc' | 'price-desc';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProductSort>('newest');
  const addItem = useCartStore((state) => state.addItem);

  const query: ListProductsQuery = {
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    sort: sort === 'newest' ? 'createdAt' : 'priceCents',
    order: sort === 'newest' || sort === 'price-desc' ? 'desc' : 'asc',
  };
  const products = useProducts(query);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <Stack spacing={{ xs: 4, md: 6 }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr' },
          alignItems: 'center',
          minHeight: { xs: 290, md: 350 },
          px: { xs: 3, sm: 5, md: 7 },
          py: { xs: 4, md: 5 },
          borderRadius: { xs: 5, md: 7 },
          color: '#fffdf8',
          background:
            'radial-gradient(circle at 78% 44%, rgba(184, 207, 171, 0.22), transparent 27%), linear-gradient(115deg, #1e4738 0%, #285b46 58%, #44745a 100%)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 650 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: 25, height: 1, bgcolor: '#e2b994' }} />
            <Typography variant="overline" sx={{ color: '#e9c8a9' }}>
              YENİ BİR ALIŞVERİŞ ALIŞKANLIĞI
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              maxWidth: 600,
              fontSize: { xs: '2.7rem', sm: '3.5rem', md: '4.45rem' },
              lineHeight: 0.99,
            }}
          >
            İyi seçimler,
            <br />
            iyi hissettirir.
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 470, color: 'rgba(255,253,248,0.76)' }}>
            Özenle seçilmiş ürünlere göz at. Siparişini birkaç adımda ver, her gelişmeden anında
            haberdar ol.
          </Typography>
          <Button
            href="#urunler"
            endIcon={<ArrowOutwardRoundedIcon />}
            sx={{
              mt: 3,
              color: '#1e4738',
              bgcolor: '#f2e4d2',
              '&:hover': { bgcolor: '#fff4e5' },
            }}
          >
            Koleksiyonu keşfet
          </Button>
        </Box>
        <Box
          aria-hidden="true"
          className="hero-orb"
          sx={{
            display: { xs: 'none', md: 'grid' },
            position: 'relative',
            justifySelf: 'center',
            placeItems: 'center',
            width: 230,
            height: 230,
            borderRadius: '46% 54% 55% 45% / 46% 42% 58% 54%',
            border: '1px solid rgba(255,255,255,0.34)',
            bgcolor: 'rgba(232, 222, 197, 0.13)',
            boxShadow: '0 30px 80px rgba(17, 44, 34, 0.22), inset 0 0 50px rgba(255,255,255,0.12)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 18,
              borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.38)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 62,
              height: 62,
              right: -16,
              top: 28,
              borderRadius: '50%',
              bgcolor: '#d38a66',
              boxShadow: '0 14px 30px rgba(20, 38, 29, 0.2)',
            },
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 86, color: '#f2e4d2', strokeWidth: 1 }} />
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            width: 380,
            height: 380,
            right: -170,
            bottom: -270,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        />
      </Box>

      <Box id="urunler">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2.5 }}
        >
          <Box>
            <Typography variant="overline" color="secondary.main">
              SANA GÖRE SEÇİLDİ
            </Typography>
            <Typography variant="h3" component="h2" sx={{ mt: 0.3 }}>
              Keşfet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Küçük detaylar, güzel seçimler.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <TextField
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Ürünlerde ara"
              aria-label="Ürünlerde ara"
              sx={{ width: { xs: '100%', sm: 290 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
              <Select
                value={sort}
                aria-label="Ürünleri sırala"
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="newest">En yeni eklenenler</MenuItem>
                <MenuItem value="price-asc">Fiyat: artan</MenuItem>
                <MenuItem value="price-desc">Fiyat: azalan</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {products.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void products.refetch()}>
                Tekrar dene
              </Button>
            }
            sx={{ mb: 2.5, borderRadius: 3 }}
          >
            {getErrorMessage(products.error)}
          </Alert>
        )}

        {products.isLoading ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 245px), 1fr))',
            }}
          >
            {Array.from({ length: 8 }, (_, index) => (
              <Card key={index} sx={{ overflow: 'hidden', p: 1.25 }}>
                <Skeleton variant="rounded" height={210} sx={{ borderRadius: 3 }} />
                <CardContent sx={{ px: 1, pb: '12px !important' }}>
                  <Skeleton width="72%" />
                  <Skeleton width="45%" />
                  <Skeleton width="60%" height={34} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : products.data?.data.length === 0 ? (
          <EmptyState
            icon={<SearchRoundedIcon />}
            title="Aradığını bulamadık"
            description="Farklı bir kelime deneyebilir ya da aramayı temizleyip tüm ürünlere dönebilirsin."
            actionLabel="Aramayı temizle"
            onAction={() => handleSearch('')}
          />
        ) : (
          <>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                {products.data?.meta.total ?? 0} ürün
              </Typography>
              {products.isFetching && (
                <Chip size="small" label="Güncelleniyor" variant="outlined" />
              )}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 1.5, sm: 2.5 },
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 245px), 1fr))',
              }}
            >
              {products.data?.data.map((product, index) => {
                const art = PRODUCT_ART[index % PRODUCT_ART.length] ?? PRODUCT_ART[0];
                return (
                  <Card
                    key={product.id}
                    sx={{
                      overflow: 'hidden',
                      transition: 'transform 220ms ease, box-shadow 220ms ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 42px rgba(34, 48, 38, 0.12)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        mx: 1.25,
                        mt: 1.25,
                        height: 205,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 3.5,
                        background: art.background,
                      }}
                    >
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 124,
                          height: 145,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '32px 32px 42px 42px',
                          color: art.color,
                          bgcolor: 'rgba(255,255,255,0.44)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          boxShadow: '0 18px 34px rgba(36, 50, 40, 0.12)',
                          transform: 'rotate(-5deg)',
                        }}
                      >
                        <Inventory2OutlinedIcon sx={{ fontSize: 58, strokeWidth: 1 }} />
                      </Box>
                      <Chip
                        size="small"
                        label={product.stock > 0 ? 'Stokta' : 'Tükendi'}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'rgba(255, 254, 250, 0.88)',
                          color: product.stock > 0 ? 'primary.main' : 'error.main',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 2.25, pb: '18px !important' }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        noWrap
                        title={product.name}
                        sx={{ fontSize: '1.02rem' }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          minHeight: 40,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                        }}
                      >
                        {product.description || 'Günlük hayatına iyi gelecek özenli bir seçim.'}
                      </Typography>
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'baseline', justifyContent: 'space-between', mt: 1.75 }}
                      >
                        <Typography variant="h5" color="primary.main">
                          {formatPrice(product.priceCents)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
                        </Typography>
                      </Stack>
                      <Button
                        fullWidth
                        variant={product.stock > 0 ? 'contained' : 'outlined'}
                        color={product.stock > 0 ? 'primary' : 'inherit'}
                        startIcon={<AddShoppingCartOutlinedIcon />}
                        disabled={product.stock === 0}
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            priceCents: product.priceCents,
                          })
                        }
                        sx={{ mt: 2 }}
                      >
                        {product.stock === 0 ? 'Şu an stokta yok' : 'Sepete ekle'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}

        {products.data && products.data.meta.totalPages > 1 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 4, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2" color="text.secondary">
              Sayfa {page} / {products.data.meta.totalPages}
            </Typography>
            <Pagination
              count={products.data.meta.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              color="primary"
              siblingCount={0}
              size="large"
            />
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
