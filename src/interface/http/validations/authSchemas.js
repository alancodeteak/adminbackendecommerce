import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  shopSlug: z.string().min(1)
});

