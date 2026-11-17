import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { Link as RouterLink } from 'react-router';
import type { Product } from '@/types/domain';
import { formatPrice } from '@/utils/format-price';
import { ProductArtwork } from './ProductArtwork';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card
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
        component={RouterLink}
        to={`/products/${product.id}`}
        aria-label={`Ürün detayını görüntüle: ${product.name}`}
        sx={{
          display: 'block',
          position: 'relative',
          mx: 1.25,
          mt: 1.25,
          textDecoration: 'none',
          '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main' },
        }}
      >
        <ProductArtwork seed={product.id} height={205} />
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
          component={RouterLink}
          to={`/products/${product.id}`}
          variant="h6"
          noWrap
          title={product.name}
          sx={{
            display: 'block',
            color: 'text.primary',
            textDecoration: 'none',
            fontSize: '1.02rem',
            '&:hover': { color: 'primary.main' },
          }}
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
          onClick={() => onAddToCart(product)}
          sx={{ mt: 2 }}
        >
          {product.stock === 0 ? 'Şu an stokta yok' : 'Sepete ekle'}
        </Button>
      </CardContent>
    </Card>
  );
}
