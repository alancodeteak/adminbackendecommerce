import { z } from "zod";

export const listShopsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(50).optional()
});

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .regex(/^[0-9+][0-9]{7,31}$/, "Invalid phone format");

const customDomainSchema = z
  .string()
  .trim()
  .max(255)
  .regex(
    /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i,
    "Invalid domain format"
  );

const addressSchema = z
  .object({
    line1: z.string().trim().max(200).optional(),
    line2: z.string().trim().max(200).optional(),
    landmark: z.string().trim().max(120).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
    postal_code: z.string().trim().max(32).optional(),
    country: z.string().trim().max(120).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    raw: z.string().trim().max(600).optional()
  })
  .partial()
  .refine(
    (v) => (v.lat === undefined && v.lng === undefined) || (v.lat !== undefined && v.lng !== undefined),
    { message: "lat and lng must be provided together", path: ["lat"] }
  );

export const createShopBodySchema = z.object({
  slug: slugSchema.transform((s) => s.toLowerCase()),
  name: z.string().trim().min(1).max(160),
  customDomain: customDomainSchema.optional(),
  phone: phoneSchema.optional(),
  email: z.string().trim().email().max(254).optional(),
  ownerUserId: z.string().uuid().optional(),
  address: addressSchema.optional()
});

export const shopIdParamsSchema = z.object({
  id: z.string().uuid()
});

