import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16).default("dev_only_change_me_please"),
  JWT_ISSUER: z.string().min(1).default("ecommerce-admin"),
  JWT_AUDIENCE: z.string().min(1).default("ecommerce-admin"),
  JWT_EXPIRES_IN: z.string().min(1).default("8h"),

  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  LOW_STOCK_THRESHOLD: z.coerce.number().nonnegative().default(5),

  // SMTP (used for OTP email delivery)
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(587),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  OTP_FROM_EMAIL: z.string().min(1).optional(),

  // OTP settings
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  OTP_REQUEST_COOLDOWN_SECONDS: z.coerce.number().int().min(0).default(30),
  OTP_DEBUG_LOG: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean()).default(false),

  // Media uploads (local storage)
  UPLOADS_DIR: z.string().min(1).default("uploads"),

  // Cloudflare R2 / S3-compatible object storage (optional — if BUCKET is set, endpoint + keys required)
  OBJECT_STORAGE_ACCESS_KEY_ID: z.string().optional().default(""),
  OBJECT_STORAGE_SECRET_ACCESS_KEY: z.string().optional().default(""),
  OBJECT_STORAGE_ENDPOINT: z.string().optional().default(""),
  OBJECT_STORAGE_BUCKET: z.string().optional().default(""),
  /** Public origin for objects (R2 custom domain or r2.dev public bucket URL), no trailing slash */
  OBJECT_STORAGE_PUBLIC_BASE_URL: z.string().optional().default(""),
  OBJECT_STORAGE_REGION: z.string().optional().default("auto"),
  /** Optional Cloudflare API token (Workers / account API — not used for S3 PutObject) */
  CLOUDFLARE_API_TOKEN: z.string().optional().default("")
}).superRefine((val, ctx) => {
  if (val.NODE_ENV === "production" && val.JWT_SECRET === "dev_only_change_me_please") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["JWT_SECRET"],
      message: "JWT_SECRET must be set in production"
    });
  }
  if (val.OBJECT_STORAGE_BUCKET?.trim()) {
    if (!val.OBJECT_STORAGE_ENDPOINT?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OBJECT_STORAGE_ENDPOINT"],
        message: "OBJECT_STORAGE_ENDPOINT is required when OBJECT_STORAGE_BUCKET is set"
      });
    }
    if (!val.OBJECT_STORAGE_ACCESS_KEY_ID?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OBJECT_STORAGE_ACCESS_KEY_ID"],
        message: "OBJECT_STORAGE_ACCESS_KEY_ID is required when OBJECT_STORAGE_BUCKET is set"
      });
    }
    if (!val.OBJECT_STORAGE_SECRET_ACCESS_KEY?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OBJECT_STORAGE_SECRET_ACCESS_KEY"],
        message: "OBJECT_STORAGE_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_BUCKET is set"
      });
    }
  }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
