import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { env } from '@/config/env';
import { loginSchema, registerSchema } from '@/modules/auth/auth.schema';
import { listUsersQuerySchema } from '@/modules/users/users.schema';
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
} from '@/modules/products/products.schema';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from '@/modules/orders/orders.schema';
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
} from '@/modules/notifications/notifications.schema';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const responseContent = (schema: z.ZodType) => ({
  'application/json': { schema },
});

const requestBody = (schema: z.ZodType) => ({
  content: responseContent(schema),
});

const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.unknown()).optional(),
  }),
});

const data = (schema: z.ZodType = z.unknown()) => z.object({ data: schema });

const listData = z.object({
  data: z.array(z.unknown()),
  meta: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
    .optional(),
});

const ok = (description: string, schema: z.ZodType = z.unknown()) => ({
  description,
  content: responseContent(data(schema)),
});
const created = (description: string) => ({
  description,
  content: responseContent(data()),
});
const badRequest = {
  description: 'Validation error',
  content: responseContent(errorSchema),
};
const unauthorized = {
  description: 'Unauthorized',
  content: responseContent(errorSchema),
};
const forbidden = {
  description: 'Forbidden',
  content: responseContent(errorSchema),
};
const notFound = {
  description: 'Not found',
  content: responseContent(errorSchema),
};
const conflict = {
  description: 'Conflict',
  content: responseContent(errorSchema),
};

// ---------- Health ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/health',
  tags: ['health'],
  security: [],
  responses: { 200: ok('Service health') },
});

// ---------- Auth ----------
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: ['auth'],
  security: [],
  request: { body: requestBody(registerSchema) },
  responses: { 201: created('User registered'), 400: badRequest },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['auth'],
  security: [],
  request: { body: requestBody(loginSchema) },
  responses: { 200: ok('Login successful'), 400: badRequest, 401: unauthorized },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/refresh',
  tags: ['auth'],
  security: [],
  description: 'Uses the refreshToken httpOnly cookie',
  responses: { 200: ok('New access token'), 401: unauthorized },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  tags: ['auth'],
  security: [],
  description: 'Uses the refreshToken httpOnly cookie',
  responses: { 204: { description: 'Logged out' }, 401: unauthorized },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  tags: ['auth'],
  responses: { 200: ok('Current user'), 401: unauthorized },
});

// ---------- Users ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/users',
  tags: ['users'],
  request: { query: listUsersQuerySchema },
  responses: {
    200: { description: 'User list', content: responseContent(listData) },
    401: unauthorized,
    403: forbidden,
  },
});

// ---------- Products ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/products',
  tags: ['products'],
  security: [],
  request: { query: listProductsQuerySchema },
  responses: {
    200: { description: 'Product list', content: responseContent(listData) },
    400: badRequest,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/products/{id}',
  tags: ['products'],
  security: [],
  request: { params: productIdParamsSchema },
  responses: { 200: ok('Product detail'), 404: notFound },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/products',
  tags: ['products'],
  request: { body: requestBody(createProductSchema) },
  responses: {
    201: created('Product created'),
    400: badRequest,
    401: unauthorized,
    403: forbidden,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/products/{id}',
  tags: ['products'],
  request: { params: productIdParamsSchema, body: requestBody(updateProductSchema) },
  responses: {
    200: ok('Product updated'),
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/products/{id}',
  tags: ['products'],
  request: { params: productIdParamsSchema },
  responses: {
    204: { description: 'Product deactivated' },
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

// ---------- Orders ----------
registry.registerPath({
  method: 'post',
  path: '/api/v1/orders',
  tags: ['orders'],
  request: { body: requestBody(createOrderSchema) },
  responses: {
    201: created('Order created'),
    400: badRequest,
    401: unauthorized,
    404: notFound,
    409: conflict,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/orders',
  tags: ['orders'],
  request: { query: listOrdersQuerySchema },
  responses: {
    200: { description: 'Order list', content: responseContent(listData) },
    400: badRequest,
    401: unauthorized,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/orders/{id}',
  tags: ['orders'],
  request: { params: orderIdParamsSchema },
  responses: { 200: ok('Order detail'), 401: unauthorized, 404: notFound },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/orders/{id}/status',
  tags: ['orders'],
  request: { params: orderIdParamsSchema, body: requestBody(updateOrderStatusSchema) },
  responses: {
    200: ok('Status updated'),
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
    409: conflict,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/orders/{id}/cancel',
  tags: ['orders'],
  request: { params: orderIdParamsSchema },
  responses: { 200: ok('Order cancelled'), 401: unauthorized, 404: notFound, 409: conflict },
});

// ---------- Notifications ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/notifications',
  tags: ['notifications'],
  request: { query: listNotificationsQuerySchema },
  responses: {
    200: { description: 'Notification list', content: responseContent(listData) },
    400: badRequest,
    401: unauthorized,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/notifications/unread-count',
  tags: ['notifications'],
  responses: { 200: ok('Unread count'), 401: unauthorized },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/notifications/{id}/read',
  tags: ['notifications'],
  request: { params: notificationIdParamsSchema },
  responses: { 200: ok('Marked as read'), 401: unauthorized, 404: notFound },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/notifications/read-all',
  tags: ['notifications'],
  responses: { 200: ok('All marked as read'), 401: unauthorized },
});

const docConfig = {
  openapi: '3.1.0',
  info: {
    title: 'NotifyHub API',
    version: '1.0.0',
    description: 'Real-time order & notification platform',
  },
  servers: [{ url: `http://localhost:${env.PORT}` }],
  security: [{ bearerAuth: [] }],
};

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument(
  docConfig,
);
