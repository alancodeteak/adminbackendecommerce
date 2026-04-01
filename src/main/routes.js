import { Router } from "express";
import { buildAdminRoutes } from "../interface/http/routes/adminRoutes.js";
import { buildSuperadminRoutes } from "../interface/http/routes/superadminRoutes.js";

export function buildRoutes() {
  const router = Router();

  router.get("/health", (_req, res) => res.json({ ok: true }));

  router.use("/api/admin", buildAdminRoutes());
  router.use("/api/superadmin", buildSuperadminRoutes());

  return router;
}

