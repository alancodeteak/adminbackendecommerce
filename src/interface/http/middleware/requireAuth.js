import { AuthError } from "../../../domain/errors/AuthError.js";
import { verifyAccessToken } from "../../../infra/auth/jwt.js";

export function requireAuth(req, _res, next) {
  const header = req.header("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(new AuthError());

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      shopId: payload.shopId,
      role: payload.role
    };
    return next();
  } catch (err) {
    return next(new AuthError("Invalid token", err));
  }
}

