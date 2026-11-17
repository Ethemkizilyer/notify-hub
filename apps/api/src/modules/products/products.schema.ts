import { z } from 'zod';
import { productIdParamsSchema } from '@notifyhub/shared';

export {
  createProductSchema,
  updateProductSchema,
  productIdParamsSchema,
  listProductsQuerySchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ListProductsQuery,
} from '@notifyhub/shared';

export type ProductIdParams = z.infer<typeof productIdParamsSchema>;
