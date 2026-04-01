import { Router } from "express";
import { validate } from "../interface/http/middleware/validate.js";
import { requireAuth } from "../interface/http/middleware/requireAuth.js";
import { login } from "../interface/http/controllers/authController.js";
import { list as listProducts } from "../interface/http/controllers/adminProductsController.js";
import { loginBodySchema } from "../interface/http/validations/authSchemas.js";
import { listProductsQuerySchema } from "../interface/http/validations/productsSchemas.js";

export function buildRoutes() {
  const router = Router();

  router.get("/health", (_req, res) => res.json({ ok: true }));

  router.post("/api/admin/auth/login", validate({ body: loginBodySchema }), login);

  router.get(
    "/api/admin/products",
    requireAuth,
    validate({ query: listProductsQuerySchema }),
    listProducts
  );

  return router;
}

