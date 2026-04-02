import { AuthError } from "../../../../domain/errors/AuthError.js";
import { ForbiddenError } from "../../../../domain/errors/ForbiddenError.js";
import { verifyPassword } from "../../../../infra/security/passwordHasher.js";
import { signAccessToken } from "../../../../infra/auth/jwt.js";

export function loginStaff({ authRepo }) {
  return async function execute(client, { email, password, shopSlug }) {
    const perf = client.perf;
    const ctx = perf
      ? await perf.measure("db_ms", async () => {
          return await authRepo.getStaffLoginContextByShopSlugAndEmail(client, { shopSlug, email });
        })
      : await authRepo.getStaffLoginContextByShopSlugAndEmail(client, { shopSlug, email });

    if (!ctx || !ctx.shop_is_active || ctx.shop_status !== "active") throw new AuthError("Invalid shop");
    if (!ctx.user_is_active) throw new AuthError("Invalid credentials");
    if (!ctx.staff_role || !ctx.staff_is_active || ctx.staff_status !== "active") {
      throw new ForbiddenError("Not a staff member for this shop");
    }

    const ok = perf
      ? await perf.measure("password_verify_ms", async () => {
          return await verifyPassword(password, ctx.password_hash);
        })
      : await verifyPassword(password, ctx.password_hash);
    if (!ok) throw new AuthError("Invalid credentials");

    const accessToken = perf
      ? await perf.measure("jwt_sign_ms", async () => {
          return signAccessToken({ userId: ctx.user_id, shopId: ctx.shop_id, role: ctx.staff_role });
        })
      : signAccessToken({ userId: ctx.user_id, shopId: ctx.shop_id, role: ctx.staff_role });

    return {
      accessToken,
      user: { id: ctx.user_id, email: ctx.email },
      shop: { id: ctx.shop_id, slug: ctx.shop_slug, name: ctx.shop_name },
      role: ctx.staff_role
    };
  };
}

