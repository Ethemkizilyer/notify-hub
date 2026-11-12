import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(2).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
