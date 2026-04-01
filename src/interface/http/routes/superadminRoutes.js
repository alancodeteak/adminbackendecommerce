import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { loginSuperadmin } from "../controllers/superadminAuthController.js";
import { superadminLoginBodySchema } from "../validations/authSchemas.js";

export function buildSuperadminRoutes() {
  const router = Router();

  router.post("/auth/login", validate({ body: superadminLoginBodySchema }), loginSuperadmin);

  router.get("/shops", requireAuth, requireRole(["superadmin"]), (_req, res) => res.json({ items: [] }));
  router.post("/shops", requireAuth, requireRole(["superadmin"]), (_req, res) => res.status(201).json({ id: null }));
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

