import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { loginAs } from '../../../tests/helpers';

type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListProductsResponse = {
  data: ProductDto[];
  meta: PaginationMeta;
};

type ProductResponse = {
  data: ProductDto;
};

type ErrorResponse = {
  error: { code: string; message: string };
};

function createProduct(
  data: {
    name?: string;
    description?: string;
    priceCents?: number;
    stock?: number;
    isActive?: boolean;
  } = {},
) {
  return prisma.product.create({
    data: { name: 'Test Product', priceCents: 1000, stock: 5, ...data },
  });
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/v1/products', () => {
  it('returns products with pagination meta', async () => {
    await createProduct({ name: 'Alpha' });
    await createProduct({ name: 'Beta' });

    const res = await request(app).get('/api/v1/products');
    const body = res.body as ListProductsResponse;

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
  });

  it('paginates results', async () => {
    await createProduct({ name: 'P1' });
    await createProduct({ name: 'P2' });
    await createProduct({ name: 'P3' });

    const res = await request(app).get('/api/v1/products?page=2&limit=2');
    const body = res.body as ListProductsResponse;

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.meta).toMatchObject({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
  });

  it('filters by search case-insensitively', async () => {
    await createProduct({ name: 'Wireless Mouse' });
    await createProduct({ name: 'Mechanical Keyboard' });

    const res = await request(app).get('/api/v1/products?search=MOUSE');
    const body = res.body as ListProductsResponse;

    expect(res.status).toBe(200);
    expect(body.data.map((p) => p.name)).toEqual(['Wireless Mouse']);
  });

  it('sorts by priceCents ascending', async () => {
    await createProduct({ name: 'Expensive', priceCents: 5000 });
    await createProduct({ name: 'Cheap', priceCents: 100 });

    const res = await request(app).get('/api/v1/products?sort=priceCents&order=asc');
    const body = res.body as ListProductsResponse;

    expect(res.status).toBe(200);
    expect(body.data.map((p) => p.name)).toEqual(['Cheap', 'Expensive']);
  });
});

describe('GET /api/v1/products/:id', () => {
  it('returns a product by id', async () => {
    const product = await createProduct({ name: 'FindMe' });

    const res = await request(app).get(`/api/v1/products/${product.id}`);
    const body = res.body as ProductResponse;

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('FindMe');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get(`/api/v1/products/${randomUUID()}`);
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/v1/products', () => {
  it('creates a product and returns 201', async () => {
    const token = await loginAs('ADMIN');

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Product', description: 'A nice product', priceCents: 2500, stock: 10 });
    const body = res.body as ProductResponse;

    expect(res.status).toBe(201);
    expect(body.data).toMatchObject({
      name: 'New Product',
      priceCents: 2500,
      stock: 10,
    });
  });

  it('returns 400 VALIDATION_ERROR for a negative price', async () => {
    const token = await loginAs('ADMIN');
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Product', priceCents: -100 });
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when name is missing', async () => {
    const token = await loginAs('ADMIN');
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: 100 });
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'No Auth', priceCents: 100 });

    expect(res.status).toBe(401);
    expect((res.body as ErrorResponse).error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 for a non-admin user', async () => {
    const token = await loginAs('USER');

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Forbidden', priceCents: 100 });

    expect(res.status).toBe(403);
    expect((res.body as ErrorResponse).error.code).toBe('FORBIDDEN');
  });
});

describe('PATCH /api/v1/products/:id', () => {
  it('updates only the given fields', async () => {
    const product = await createProduct({ stock: 5 });

    const token = await loginAs('ADMIN');
    const res = await request(app)
      .patch(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 3 });
    const body = res.body as ProductResponse;

    expect(res.status).toBe(200);
    expect(body.data.stock).toBe(3);
    expect(body.data.name).toBe('Test Product');
  });

  it('returns 404 for an unknown id', async () => {
    const token = await loginAs('ADMIN');
    const res = await request(app)
      .patch(`/api/v1/products/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 3 });
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/v1/products/:id', () => {
  it('soft-deletes: removes from list and detail returns 404', async () => {
    const product = await createProduct();

    const token = await loginAs('ADMIN');
    const del = await request(app)
      .delete(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const list = await request(app).get('/api/v1/products').set('Authorization', `Bearer ${token}`);
    const listBody = list.body as ListProductsResponse;
    expect(listBody.data).toHaveLength(0);

    const detail = await request(app)
      .get(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(404);
  });

  it('returns 404 for an unknown id', async () => {
    const token = await loginAs('ADMIN');
    const res = await request(app)
      .delete(`/api/v1/products/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`);
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
