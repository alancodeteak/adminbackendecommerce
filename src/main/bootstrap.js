import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { createServer } from "./server.js";
import { pool } from "../infra/db/pool.js";
import { isR2Configured } from "../infra/media/storeR2Object.js";

async function main() {
  const app = createServer();

  // Startup DB check
  await pool.query("select 1 as ok");

  if (isR2Configured()) {
    logger.info(
      { shopImages: "cloudflare_r2", bucket: env.OBJECT_STORAGE_BUCKET },
      "Shop entity images will be stored in R2"
    );
  } else {
    logger.info(
      { shopImages: "local_disk", uploadsDir: env.UPLOADS_DIR },
      "Shop entity images will be stored locally (set OBJECT_STORAGE_* for R2)"
    );
  }

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Admin API listening");
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

