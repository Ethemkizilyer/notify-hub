import type {
  ApiResponse,
  CreateProductInput,
  ListProductsQuery,
  PaginatedResponse,
  UpdateProductInput,
} from '@notifyhub/shared';
import { apiClient } from '@/lib/api-client';
import type { Product } from '@/types/domain';

export async function listProducts(query: ListProductsQuery): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params: query });
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await apiClient.post<ApiResponse<Product>>('/products', input);
  return data.data;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, input);
  return data.data;
}

export async function deactivateProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
