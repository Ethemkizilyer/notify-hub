import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_QUANTITY, useCartStore } from '@/stores/cart.store';

const product = { productId: 'p1', name: 'Kulaklık', priceCents: 2500 };

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('adds a new product with quantity 1', () => {
    useCartStore.getState().addItem(product);
    expect(useCartStore.getState().items).toEqual([{ ...product, quantity: 1 }]);
  });

  it('increments quantity when the same product is added again', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it('clamps quantity between 1 and the maximum', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().setQuantity('p1', 0);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
    useCartStore.getState().setQuantity('p1', 1000);
    expect(useCartStore.getState().items[0]?.quantity).toBe(MAX_QUANTITY);
  });

  it('removes a product', () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toEqual([]);
  });
});
