import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from './products.schema';
import { getSkip } from '@/utils/pagination';
import { AppError } from '@/utils/app-error';

export async function listProducts(query: ListProductsQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: getSkip(query.page, query.limit),
      take: query.limit,
      orderBy: { [query.sort]: query.order },
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function createProduct(input: CreateProductInput) {
  return prisma.product.create({
    data: input,
  });
}

export async function updateProduct(id: string, input: Partial<UpdateProductInput>) {
  await getProductById(id);
  return prisma.product.update({
    where: { id },
    data: input,
  });
}

export async function deactivateProduct(id: string) {
  await getProductById(id);
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}
