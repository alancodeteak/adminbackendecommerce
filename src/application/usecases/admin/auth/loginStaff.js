import { AuthError } from "../../../../domain/errors/AuthError.js";
import { ForbiddenError } from "../../../../domain/errors/ForbiddenError.js";
import { verifyPassword } from "../../../../infra/security/passwordHasher.js";
import { signAccessToken } from "../../../../infra/auth/jwt.js";

export function loginStaff({ authRepo }) {
  return async function execute(client, { email, password, shopSlug }) {
    const shop = await authRepo.getShopBySlug(client, shopSlug);
    if (!shop || !shop.is_active) throw new AuthError("Invalid shop");

    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) throw new AuthError("Invalid credentials");

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) throw new AuthError("Invalid credentials");

    const role = await authRepo.getActiveStaffRole(client, shop.id, user.id);
    if (!role) throw new ForbiddenError("Not a staff member for this shop");

    const accessToken = signAccessToken({ userId: user.id, shopId: shop.id, role });

    return {
      accessToken,
      user: { id: user.id, email: user.email },
      shop: { id: shop.id, slug: shop.slug, name: shop.name },
      role
    };
  };
}

