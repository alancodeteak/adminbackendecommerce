import { ForbiddenError } from "../../../domain/errors/ForbiddenError.js";

export function requireRole(allowedRoles) {
  const allowed = new Set(allowedRoles);
  return (req, _res, next) => {
    const role = req.auth?.role;
    if (!role || !allowed.has(role)) return next(new ForbiddenError());
    return next();
  };
}

