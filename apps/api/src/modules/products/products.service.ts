import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from './products.schema';
import { getSkip } from '@/utils/pagination';
import { AppError } from '@/utils/app-error';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { env } from '@/config/env';
import type { Product } from '@/generated/prisma/client';

type ProductListResult = { items: Product[]; total: number };

const LIST_CACHE_PREFIX = 'products:list:';
const LIST_CACHE_TTL_SECONDS = 60;
const isTest = env.NODE_ENV === 'test';

function buildListCacheKey(query: ListProductsQuery): string {
  return `${LIST_CACHE_PREFIX}${JSON.stringify(query)}`;
}

async function getCachedProductList(key: string) {
  if (isTest) return null;
  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as ProductListResult) : null;
  } catch (error) {
    logger.warn({ err: error }, 'Product list cache read failed');
    return null;
  }
}

async function setCachedProductList(key: string, value: ProductListResult): Promise<void> {
  if (isTest) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', LIST_CACHE_TTL_SECONDS);
  } catch (error) {
    logger.warn({ err: error }, 'Product list cache write failed');
  }
}

async function invalidateProductListCache(): Promise<void> {
  if (isTest) return;
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${LIST_CACHE_PREFIX}*`,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.warn({ err: error }, 'Product list cache invalidation failed');
  }
}

export async function listProducts(query: ListProductsQuery) {
  const cacheKey = buildListCacheKey(query);
  const cached = await getCachedProductList(cacheKey);
  if (cached) return cached;

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

  const result: ProductListResult = { items, total };
  await setCachedProductList(cacheKey, result);
  return result;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({ data: input });
  await invalidateProductListCache();
  return product;
}

export async function updateProduct(id: string, input: Partial<UpdateProductInput>) {
  await getProductById(id);
  const product = await prisma.product.update({ where: { id }, data: input });
  await invalidateProductListCache();
  return product;
}

export async function deactivateProduct(id: string) {
  await getProductById(id);
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  await invalidateProductListCache();
  return product;
}
