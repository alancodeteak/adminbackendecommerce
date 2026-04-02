import { AuthError } from "../../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../../infra/security/passwordHasher.js";
import { signAccessToken } from "../../../../infra/auth/jwt.js";
import { env } from "../../../../config/env.js";

export function verifySuperadminOtp({ authRepo }) {
  return async function execute(client, { email, otp }) {
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) throw new AuthError("Invalid OTP");

    const superadmin = await authRepo.getActiveSuperadmin(client, user.id);
    if (!superadmin || !superadmin.is_active) throw new AuthError("Invalid OTP");

    if (!superadmin.otp_hash || !superadmin.otp_expires_at) throw new AuthError("Invalid OTP");
    if (superadmin.otp_used_at) throw new AuthError("Invalid OTP");
    if (new Date(superadmin.otp_expires_at).getTime() <= Date.now()) throw new AuthError("Invalid OTP");

    const ok = await verifyPassword(otp, superadmin.otp_hash);
    if (!ok) {
      const newAttempts = (superadmin.otp_attempts ?? 0) + 1;
      await authRepo.incrementSuperadminOtpAttempts(client, user.id);
      if (newAttempts >= env.OTP_MAX_ATTEMPTS) {
        await authRepo.markSuperadminOtpUsed(client, user.id);
      }
      throw new AuthError("Invalid OTP");
    }

    await authRepo.markSuperadminOtpUsed(client, user.id);

    const role = "superadmin";
    const accessToken = signAccessToken({ userId: user.id, role });

    return {
      accessToken,
      user: { id: user.id, email: user.email },
      role
    };
  };
}

