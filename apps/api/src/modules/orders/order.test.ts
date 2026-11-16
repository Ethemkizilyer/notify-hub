import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { createProduct, loginAs, loginWithCookie } from '../../../tests/helpers';

type OrderItemDto = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  product?: { id: string; name: string; priceCents: number };
};

type OrderDto = {
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  items: OrderItemDto[];
};

type OrderResponse = { data: OrderDto };
type OrderListResponse = {
  data: OrderDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
type ErrorResponse = { error: { code: string; message: string } };

afterAll(async () => {
  await prisma.$disconnect();
});

function placeOrder(token: string, items: { productId: string; quantity: number }[]) {
  return request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items });
}

function setStatus(adminToken: string, orderId: string, status: string) {
  return request(app)
    .patch(`/api/v1/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status });
}

async function getProductStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  return product?.stock;
}

describe('POST /api/v1/orders', () => {
  it('creates an order with total computed from DB prices', async () => {
    const product = await createProduct({ priceCents: 2500, stock: 10 });
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await placeOrder(token, [{ productId: product.id, quantity: 2 }]);

    expect(res.status).toBe(201);
    const body = res.body as OrderResponse;
    expect(body.data.status).toBe('PENDING');
    expect(body.data.totalCents).toBe(5000);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0]?.unitPriceCents).toBe(2500);
    expect(await getProductStock(product.id)).toBe(8);
  });

  it('ignores client-sent price fields', async () => {
    const product = await createProduct({ priceCents: 2500, stock: 10 });
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: 1,
            unitPriceCents: 1,
          },
        ],
      });

    expect(res.status).toBe(201);
    const body = res.body as OrderResponse;
    expect(body.data.totalCents).toBe(2500);
    expect(body.data.items[0]?.unitPriceCents).toBe(2500);
  });

  it('returns 409 and keeps stock unchanged when stock is insufficient', async () => {
    const product = await createProduct({ stock: 1 });
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await placeOrder(token, [{ productId: product.id, quantity: 5 }]);

    expect(res.status).toBe(409);
    expect((res.body as ErrorResponse).error.code).toBe('CONFLICT');
    expect(await getProductStock(product.id)).toBe(1);
  });

  it('returns 404 for an unknown product', async () => {
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await placeOrder(token, [{ productId: randomUUID(), quantity: 1 }]);

    expect(res.status).toBe(404);
  });

  it('returns 404 for an inactive product', async () => {
    const product = await createProduct({ isActive: false });
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);

    expect(res.status).toBe(404);
  });

  it('returns 400 for duplicate productIds', async () => {
    const product = await createProduct();
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await placeOrder(token, [
      { productId: product.id, quantity: 1 },
      { productId: product.id, quantity: 2 },
    ]);

    expect(res.status).toBe(400);
    expect((res.body as ErrorResponse).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for empty items and invalid quantity', async () => {
    const { accessToken: token } = await loginWithCookie('USER');
    const product = await createProduct();

    const empty = await placeOrder(token, []);
    expect(empty.status).toBe(400);

    const zero = await placeOrder(token, [{ productId: product.id, quantity: 0 }]);
    expect(zero.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const product = await createProduct();

    const res = await request(app)
      .post('/api/v1/orders')
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/orders', () => {
  it("returns only the current user's orders", async () => {
    const product = await createProduct({ stock: 20 });
    const { accessToken: tokenA, user: userA } = await loginWithCookie('USER');
    const { accessToken: tokenB } = await loginWithCookie('USER');

    await placeOrder(tokenA, [{ productId: product.id, quantity: 1 }]);
    await placeOrder(tokenB, [{ productId: product.id, quantity: 1 }]);

    const res = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const body = res.body as OrderListResponse;
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.userId).toBe(userA.id);
  });

  it('filters orders by status', async () => {
    const product = await createProduct({ stock: 20 });
    const { accessToken: token } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const second = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const secondId = (second.body as OrderResponse).data.id;
    await setStatus(adminToken, secondId, 'CONFIRMED');

    const pending = await request(app)
      .get('/api/v1/orders?status=PENDING')
      .set('Authorization', `Bearer ${token}`);
    expect((pending.body as OrderListResponse).data).toHaveLength(1);

    const confirmed = await request(app)
      .get('/api/v1/orders?status=CONFIRMED')
      .set('Authorization', `Bearer ${token}`);
    expect((confirmed.body as OrderListResponse).data).toHaveLength(1);
  });

  it('lets admin list all orders and filter by userId', async () => {
    const product = await createProduct({ stock: 20 });
    const { accessToken: tokenA, user: userA } = await loginWithCookie('USER');
    const { accessToken: tokenB } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    await placeOrder(tokenA, [{ productId: product.id, quantity: 1 }]);
    await placeOrder(tokenB, [{ productId: product.id, quantity: 1 }]);

    const all = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect((all.body as OrderListResponse).data).toHaveLength(2);

    const filtered = await request(app)
      .get(`/api/v1/orders?userId=${userA.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const filteredBody = filtered.body as OrderListResponse;
    expect(filteredBody.data).toHaveLength(1);
    expect(filteredBody.data[0]?.userId).toBe(userA.id);
  });
});

describe('GET /api/v1/orders/:id', () => {
  it('returns the order with items and product names for the owner', async () => {
    const product = await createProduct({ name: 'Detail Product', stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const body = res.body as OrderResponse;
    expect(body.data.items[0]?.product?.name).toBe('Detail Product');
  });

  it("returns 404 for another user's order", async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: ownerToken } = await loginWithCookie('USER');
    const { accessToken: otherToken } = await loginWithCookie('USER');

    const placed = await placeOrder(ownerToken, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
    expect((res.body as ErrorResponse).error.code).toBe('NOT_FOUND');
  });

  it('returns the order for an admin', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: ownerToken } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    const placed = await placeOrder(ownerToken, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 404 for an unknown id', async () => {
    const { accessToken: token } = await loginWithCookie('USER');

    const res = await request(app)
      .get(`/api/v1/orders/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/orders/:id/status', () => {
  it('walks the happy path PENDING -> CONFIRMED -> SHIPPED -> DELIVERED', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    for (const status of ['CONFIRMED', 'SHIPPED', 'DELIVERED']) {
      const res = await setStatus(adminToken, orderId, status);
      expect(res.status).toBe(200);
      expect((res.body as OrderResponse).data.status).toBe(status);
    }
  });

  it('returns 409 for an illegal transition', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const res = await setStatus(adminToken, orderId, 'DELIVERED');
    expect(res.status).toBe(409);
    expect((res.body as ErrorResponse).error.code).toBe('CONFLICT');
  });

  it('returns 403 for a non-admin and 401 without a token', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: userToken } = await loginWithCookie('USER');

    const placed = await placeOrder(userToken, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const forbidden = await setStatus(userToken, orderId, 'CONFIRMED');
    expect(forbidden.status).toBe(403);

    const noToken = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .send({ status: 'CONFIRMED' });
    expect(noToken.status).toBe(401);
  });
});

describe('POST /api/v1/orders/:id/cancel', () => {
  it('lets the owner cancel a PENDING order and restores stock', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 2 }]);
    const orderId = (placed.body as OrderResponse).data.id;
    expect(await getProductStock(product.id)).toBe(3);

    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect((res.body as OrderResponse).data.status).toBe('CANCELLED');
    expect(await getProductStock(product.id)).toBe(5);
  });

  it('returns 409 when cancelling a non-PENDING order', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;
    await setStatus(adminToken, orderId, 'CONFIRMED');

    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(await getProductStock(product.id)).toBe(4);
  });

  it("returns 404 for another user's order", async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: ownerToken } = await loginWithCookie('USER');
    const { accessToken: otherToken } = await loginWithCookie('USER');

    const placed = await placeOrder(ownerToken, [{ productId: product.id, quantity: 1 }]);
    const orderId = (placed.body as OrderResponse).data.id;

    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  it('restores stock when admin cancels via the status endpoint', async () => {
    const product = await createProduct({ stock: 5 });
    const { accessToken: token } = await loginWithCookie('USER');
    const adminToken = await loginAs('ADMIN');

    const placed = await placeOrder(token, [{ productId: product.id, quantity: 2 }]);
    const orderId = (placed.body as OrderResponse).data.id;
    expect(await getProductStock(product.id)).toBe(3);

    const res = await setStatus(adminToken, orderId, 'CANCELLED');

    expect(res.status).toBe(200);
    expect(await getProductStock(product.id)).toBe(5);
  });
});
