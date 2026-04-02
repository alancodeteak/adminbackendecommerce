import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { loginSuperadmin } from "../controllers/superadminAuthController.js";
import {
  superadminLoginBodySchema,
  superadminOtpRequestBodySchema,
  superadminOtpVerifyBodySchema
} from "../validations/authSchemas.js";
import {
  createShopBodySchema,
  listShopsQuerySchema,
  shopIdParamsSchema
} from "../validations/shopsSchemas.js";
import {
  create as createShop,
  get as getShop,
  list as listShops,
  uploadImage as uploadShopImage
} from "../controllers/superadminShopsController.js";
import { requestOtp, verifyOtp } from "../controllers/superadminOtpController.js";
import { uploadImage } from "../middleware/uploadImage.js";

export function buildSuperadminRoutes() {
  const router = Router();

  router.post("/auth/login", validate({ body: superadminLoginBodySchema }), loginSuperadmin);
  router.post(
    "/auth/request-otp",
    validate({ body: superadminOtpRequestBodySchema }),
    requestOtp
  );
  router.post(
    "/auth/verify-otp",
    validate({ body: superadminOtpVerifyBodySchema }),
    verifyOtp
  );

  router.get(
    "/shops",
    requireAuth,
    requireRole(["superadmin"]),
    validate({ query: listShopsQuerySchema }),
    listShops
  );
  router.get(
    "/shops/:id",
    requireAuth,
    requireRole(["superadmin"]),
    validate({ params: shopIdParamsSchema }),
    getShop
  );
  router.post(
    "/shops",
    requireAuth,
    requireRole(["superadmin"]),
    validate({ body: createShopBodySchema }),
    createShop
  );
  router.post(
    "/shops/:id/image",
    requireAuth,
    requireRole(["superadmin"]),
    validate({ params: shopIdParamsSchema }),
    uploadImage,
    uploadShopImage
  );
  router.patch(
    "/shops/:id/status",
    requireAuth,
    requireRole(["superadmin"]),
    (_req, res) => res.json({ ok: true })
  );

  router.get(
    "/platform-metrics",
    requireAuth,
    requireRole(["superadmin"]),
    (_req, res) => res.json({ ordersCount: 0, revenueMinor: 0, currency: "INR" })
  );

  return router;
}

