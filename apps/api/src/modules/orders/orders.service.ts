import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/app-error';
import type { CreateOrderInput, ListOrdersQuery } from './orders.schema';
import type { Prisma, Role } from '@/generated/prisma/browser';
import { PUBLIC_USER_SELECT } from '../auth/auth.service';
import { getSkip } from '@/utils/pagination';
type OrderViewer = { id: string; role: Role };

export async function createOrder(userId: string, input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);

    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const resolvedItems = input.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw AppError.notFound(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw AppError.conflict('Insufficient stock', {
          productId: item.productId,
          available: product.stock,
          requested: item.quantity,
        });
      }
      return { productId: item.productId, quantity: item.quantity, product };
    });

    const sortedItems = [...resolvedItems].sort((a, b) => a.productId.localeCompare(b.productId));

    for (const item of sortedItems) {
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) {
        throw AppError.conflict('Insufficient stock', {
          productId: item.productId,
        });
      }
    }

    const totalCents = resolvedItems.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0,
    );

    return tx.order.create({
      data: {
        userId,
        totalCents,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.product.priceCents,
          })),
        },
      },
      include: { items: true },
    });
  });
}

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, priceCents: true } },
    },
  },
  user: { select: PUBLIC_USER_SELECT },
} as const;

export async function listOrders(viewer: OrderViewer, query: ListOrdersQuery) {
  const where: Prisma.OrderWhereInput = {
    ...(viewer.role === 'ADMIN'
      ? query.userId
        ? { userId: query.userId }
        : {}
      : { userId: viewer.id }),
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      skip: getSkip(query.page, query.limit),
      take: query.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
}

export async function getOrderById(viewer: OrderViewer, id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: ORDER_INCLUDE,
  });

  if (!order || (order.userId !== viewer.id && viewer.role !== 'ADMIN')) {
    throw AppError.notFound('Order not found');
  }

  return order;
}
