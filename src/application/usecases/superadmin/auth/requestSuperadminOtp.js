import crypto from "crypto";
import { hashPassword } from "../../../../infra/security/passwordHasher.js";
import { env } from "../../../../config/env.js";
import { logger } from "../../../../config/logger.js";

function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000);
  return String(otp);
}

export function requestSuperadminOtp({ authRepo, sendOtpEmail }) {
  return async function execute(client, { email }) {
    // Avoid account enumeration: always return ok=true.
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) return { ok: true };

    const superadmin = await authRepo.getActiveSuperadmin(client, user.id);
    if (!superadmin || !superadmin.is_active) return { ok: true };

    const now = Date.now();
    if (superadmin?.otp_last_sent_at) {
      const ageSeconds = (now - new Date(superadmin.otp_last_sent_at).getTime()) / 1000;
      if (ageSeconds <= env.OTP_REQUEST_COOLDOWN_SECONDS) return { ok: true };
    }

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(now + env.OTP_TTL_MINUTES * 60_000);

    await authRepo.setSuperadminOtp(client, { userId: user.id, otpHash, expiresAt });

    if (env.OTP_DEBUG_LOG && env.NODE_ENV !== "production") {
      logger.warn({ email, otp }, "DEV OTP (do not enable in production)");
    }

    await sendOtpEmail({ to: email, otp, purpose: "superadmin_login" });

    return { ok: true };
  };
}

