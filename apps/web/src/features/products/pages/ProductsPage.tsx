import { useEffect, useState } from 'react';
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
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { listProductsQuerySchema, type ListProductsQuery } from '@notifyhub/shared';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCartStore } from '@/stores/cart.store';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 12;
const DEFAULT_QUERY = listProductsQuerySchema.parse({ limit: PAGE_SIZE });
type ProductSort =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'stock-asc'
  | 'stock-desc';

const SORT_QUERY: Record<ProductSort, Pick<ListProductsQuery, 'sort' | 'order'>> = {
  newest: { sort: 'createdAt', order: 'desc' },
  oldest: { sort: 'createdAt', order: 'asc' },
  'price-asc': { sort: 'priceCents', order: 'asc' },
  'price-desc': { sort: 'priceCents', order: 'desc' },
  'name-asc': { sort: 'name', order: 'asc' },
  'name-desc': { sort: 'name', order: 'desc' },
  'stock-asc': { sort: 'stock', order: 'asc' },
  'stock-desc': { sort: 'stock', order: 'desc' },
};

function getSortPreset(query: ListProductsQuery): ProductSort {
  if (query.sort === 'priceCents') return query.order === 'asc' ? 'price-asc' : 'price-desc';
  if (query.sort === 'name') return query.order === 'asc' ? 'name-asc' : 'name-desc';
  if (query.sort === 'stock') return query.order === 'asc' ? 'stock-asc' : 'stock-desc';
  return query.order === 'asc' ? 'oldest' : 'newest';
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryResult = listProductsQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    limit: PAGE_SIZE,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: searchParams.get('order') ?? undefined,
  });
  const query = queryResult.success ? queryResult.data : DEFAULT_QUERY;
  const urlSearch = query.search ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const addItem = useCartStore((state) => state.addItem);

  const products = useProducts(query);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (queryResult.success) return;
    const nextParams = new URLSearchParams(searchParams);
    for (const key of ['page', 'search', 'sort', 'order']) nextParams.delete(key);
    setSearchParams(nextParams, { replace: true });
  }, [queryResult.success, searchParams, setSearchParams]);

  useEffect(() => {
    const normalizedSearch = searchInput.trim();
    if (normalizedSearch === urlSearch) return;

    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (normalizedSearch) nextParams.set('search', normalizedSearch);
      else nextParams.delete('search');
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, searchParams, setSearchParams, urlSearch]);

  function handleSort(value: ProductSort) {
    const nextParams = new URLSearchParams(searchParams);
    const selected = SORT_QUERY[value];
    nextParams.set('sort', selected.sort);
    nextParams.set('order', selected.order);
    nextParams.delete('page');
    setSearchParams(nextParams);
  }

  function handlePageChange(value: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(value));
    setSearchParams(nextParams);
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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
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
                value={getSortPreset(query)}
                aria-label="Ürünleri sırala"
                onChange={(event) => handleSort(event.target.value)}
              >
                <MenuItem value="newest">En yeni eklenenler</MenuItem>
                <MenuItem value="oldest">En eski eklenenler</MenuItem>
                <MenuItem value="price-asc">Fiyat: artan</MenuItem>
                <MenuItem value="price-desc">Fiyat: azalan</MenuItem>
                <MenuItem value="name-asc">Ad: A-Z</MenuItem>
                <MenuItem value="name-desc">Ad: Z-A</MenuItem>
                <MenuItem value="stock-asc">Stok: artan</MenuItem>
                <MenuItem value="stock-desc">Stok: azalan</MenuItem>
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
            onAction={() => setSearchInput('')}
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
              {products.data?.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(selectedProduct) =>
                    addItem({
                      productId: selectedProduct.id,
                      name: selectedProduct.name,
                      priceCents: selectedProduct.priceCents,
                    })
                  }
                />
              ))}
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
              Sayfa {query.page} / {products.data.meta.totalPages}
            </Typography>
            <Pagination
              count={products.data.meta.totalPages}
              page={query.page}
              onChange={(_, value) => handlePageChange(value)}
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
