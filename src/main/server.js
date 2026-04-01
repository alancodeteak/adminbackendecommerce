import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { requestLogger } from "../infra/logging/requestLogger.js";
import { buildRoutes } from "./routes.js";
import { notFound } from "../interface/http/middleware/notFound.js";
import { errorHandler } from "../interface/http/middleware/errorHandler.js";

export function createServer() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 300
    })
  );

  app.use(buildRoutes());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

