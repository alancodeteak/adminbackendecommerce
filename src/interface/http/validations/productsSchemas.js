import { z } from "zod";

export const listProductsQuerySchema = z.object({
  status: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  q: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

