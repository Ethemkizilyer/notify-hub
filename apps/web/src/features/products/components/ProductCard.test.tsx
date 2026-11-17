import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types/domain';
import { ProductCard } from '@/features/products/components/ProductCard';
import { formatPrice } from '@/utils/format-price';

const product: Product = {
  id: '8e807e48-58f5-4c07-8a29-c4f4b46202b0',
  name: 'Seramik kahve fincanı',
  description: 'El yapımı seramik fincan.',
  priceCents: 12990,
  stock: 4,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('ProductCard', () => {
  it('shows product information and calls the cart action', () => {
    const onAddToCart = vi.fn<(selectedProduct: Product) => void>();

    render(
      <MemoryRouter>
        <ProductCard product={product} onAddToCart={onAddToCart} />
      </MemoryRouter>,
    );

    expect(screen.getByText(product.name)).toBeTruthy();
    expect(screen.getByText(formatPrice(product.priceCents))).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Sepete ekle' }));

    expect(onAddToCart).toHaveBeenCalledWith(product);
  });
});
