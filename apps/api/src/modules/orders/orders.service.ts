import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/app-error';
import type { CreateOrderInput } from './orders.schema';

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
