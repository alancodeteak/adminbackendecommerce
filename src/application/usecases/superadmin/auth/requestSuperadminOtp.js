import crypto from "crypto";
import { AuthError } from "../../../../domain/errors/AuthError.js";
import { hashPassword } from "../../../../infra/security/passwordHasher.js";
import { env } from "../../../../config/env.js";

function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000);
  return String(otp);
}

export function requestSuperadminOtp({ authRepo, otpRepo, sendOtpEmail }) {
  return async function execute(client, { email }) {
    // Avoid account enumeration: always return ok=true.
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) return { ok: true };

    const superadmin = await authRepo.getActiveSuperadmin(client, user.id);
    if (!superadmin || !superadmin.is_active) return { ok: true };

    const latest = await otpRepo.getLatestUnusedOtpByEmailAndPurpose(
      client,
      email,
      "superadmin_login"
    );

    const now = Date.now();
    if (latest?.created_at) {
      const ageSeconds = (now - new Date(latest.created_at).getTime()) / 1000;
      if (ageSeconds <= env.OTP_REQUEST_COOLDOWN_SECONDS) return { ok: true };
    }

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(now + env.OTP_TTL_MINUTES * 60_000);

    await otpRepo.createOtp(client, {
      userId: user.id,
      email,
      purpose: "superadmin_login",
      otpHash,
      expiresAt
    });

    await sendOtpEmail({ to: email, otp, purpose: "superadmin_login" });

    return { ok: true };
  };
}

