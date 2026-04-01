import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireTenant } from "../middleware/requireTenant.js";
import { login } from "../controllers/authController.js";
import { list as listProducts } from "../controllers/adminProductsController.js";
import { loginBodySchema } from "../validations/authSchemas.js";
import { listProductsQuerySchema } from "../validations/productsSchemas.js";

export function buildAdminRoutes() {
  const router = Router();

  router.post("/auth/login", validate({ body: loginBodySchema }), login);

  router.get(
    "/products",
    requireAuth,
    requireTenant,
    validate({ query: listProductsQuerySchema }),
    listProducts
  );

  return router;
}

