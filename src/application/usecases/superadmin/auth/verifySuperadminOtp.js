import { AuthError } from "../../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../../infra/security/passwordHasher.js";
import { signAccessToken } from "../../../../infra/auth/jwt.js";
import { env } from "../../../../config/env.js";

export function verifySuperadminOtp({ authRepo, otpRepo }) {
  return async function execute(client, { email, otp }) {
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) throw new AuthError("Invalid OTP");

    const superadmin = await authRepo.getActiveSuperadmin(client, user.id);
    if (!superadmin || !superadmin.is_active) throw new AuthError("Invalid OTP");

    const record = await otpRepo.getLatestUnusedOtpByEmailAndPurpose(
      client,
      email,
      "superadmin_login"
    );

    if (!record) throw new AuthError("Invalid OTP");

    const ok = await verifyPassword(otp, record.otp_hash);
    if (!ok) {
      const newAttempts = (record.attempts ?? 0) + 1;
      await otpRepo.incrementOtpAttempts(client, record.id);
      if (newAttempts >= env.OTP_MAX_ATTEMPTS) {
        await otpRepo.markOtpUsed(client, record.id);
      }
      throw new AuthError("Invalid OTP");
    }

    await otpRepo.markOtpUsed(client, record.id);

    const role = "superadmin";
    const accessToken = signAccessToken({ userId: user.id, role });

    return {
      accessToken,
      user: { id: user.id, email: user.email },
      role
    };
  };
}

