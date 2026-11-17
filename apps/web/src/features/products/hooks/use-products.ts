import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { ListProductsQuery } from '@notifyhub/shared';
import { queryClient } from '@/lib/query-client';
import {
  createProduct,
  deactivateProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '@/features/products/api/products.api';

export const productKeys = {
  all: ['products'] as const,
  list: (query: ListProductsQuery) => ['products', 'list', query] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
};

export function useProducts(query: ListProductsQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: id.length > 0,
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

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
