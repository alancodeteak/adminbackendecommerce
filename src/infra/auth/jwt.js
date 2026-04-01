import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function signAccessToken({ userId, shopId, role }) {
  return jwt.sign(
    { sub: userId, shopId, role },
    env.JWT_SECRET,
    {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
}

