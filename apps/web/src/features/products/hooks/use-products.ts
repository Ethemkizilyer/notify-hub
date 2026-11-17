import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { ListProductsQuery } from '@notifyhub/shared';
import { queryClient } from '@/lib/query-client';
import {
  createProduct,
  deactivateProduct,
  listProducts,
} from '@/features/products/api/products.api';

export const productKeys = {
  all: ['products'] as const,
  list: (query: ListProductsQuery) => ['products', 'list', query] as const,
};

export function useProducts(query: ListProductsQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeactivateProduct() {
  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
