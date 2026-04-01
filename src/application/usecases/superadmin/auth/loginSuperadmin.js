import { AuthError } from "../../../../domain/errors/AuthError.js";
import { ForbiddenError } from "../../../../domain/errors/ForbiddenError.js";
import { verifyPassword } from "../../../../infra/security/passwordHasher.js";
import { signAccessToken } from "../../../../infra/auth/jwt.js";

export function loginSuperadmin({ authRepo }) {
  return async function execute(client, { email, password }) {
    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) throw new AuthError("Invalid credentials");

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) throw new AuthError("Invalid credentials");

    const superadmin = await authRepo.getActiveSuperadmin(client, user.id);
    if (!superadmin) throw new ForbiddenError("Not a superadmin");

    const role = "superadmin";
    const accessToken = signAccessToken({ userId: user.id, role });

    return {
      accessToken,
      user: { id: user.id, email: user.email },
      role
    };
  };
}

