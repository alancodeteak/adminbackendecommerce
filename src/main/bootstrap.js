import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { createServer } from "./server.js";
import { pool } from "../infra/db/pool.js";

async function main() {
  const app = createServer();

  // Startup DB check
  await pool.query("select 1 as ok");

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Admin API listening");
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

