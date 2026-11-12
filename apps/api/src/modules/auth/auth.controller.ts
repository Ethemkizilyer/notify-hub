import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { registerSchema } from './auth.schema';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json({ data: await authService.register(input) });
}
