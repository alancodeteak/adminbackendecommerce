import { z } from "zod";

const boolFromString = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === "boolean") return val;
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

export const listShopsQuerySchema = z.object({
  q: z.string().min(1).optional(),
  status: z.enum(["active", "blocked", "deleted"]).optional(),
  isActive: boolFromString.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const shopIdParamsSchema = z.object({
  id: z.string().uuid()
});

