import { AuthError } from "../../../domain/errors/AuthError.js";

export function requireTenant(req, _res, next) {
  if (!req.auth?.shopId) return next(new AuthError("Missing tenant context (shopId)"));
  return next();
}

