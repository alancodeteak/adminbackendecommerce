import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  shopSlug: z.string().min(1)
});

export const superadminLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const superadminOtpRequestBodySchema = z.object({
  email: z.string().email()
});

export const superadminOtpVerifyBodySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code")
});

