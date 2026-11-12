import {
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
  createProductSchema,
} from './products.schema';
import * as productsService from './products.service';
import type { Request, Response } from 'express';
import { buildPaginationMeta } from '@/utils/pagination';

export async function list(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const { items, total } = await productsService.listProducts(query);
  res.json({ data: items, meta: buildPaginationMeta(query.page, query.limit, total) });
}

export async function getById(req: Request, res: Response) {
  const { id } = productIdParamsSchema.parse(req.params);
  res.json({ data: await productsService.getProductById(id) });
}

export async function create(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  res.status(201).json({ data: await productsService.createProduct(input) });
}

export async function update(req: Request, res: Response) {
  const { id } = productIdParamsSchema.parse(req.params);
  const input = updateProductSchema.parse(req.body);
  res.json({ data: await productsService.updateProduct(id, input) });
}

export async function deactivate(req: Request, res: Response) {
  const { id } = productIdParamsSchema.parse(req.params);
  await productsService.deactivateProduct(id);
  res.status(204).send();
}
