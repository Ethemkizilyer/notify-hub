import type { Request, Response } from 'express';
import { buildPaginationMeta } from '@/utils/pagination';
import * as usersService from './users.service';
import { listUsersQuerySchema } from './users.schema';

export async function list(req: Request, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  const { items, total } = await usersService.listUsers(query);
  res.json({
    data: items,
    meta: buildPaginationMeta(query.page, query.limit, total),
  });
}
