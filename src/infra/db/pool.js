import pg from "pg";
import { env } from "../../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Supabase often benefits from SSL; pg will negotiate if required.
  ssl: env.NODE_ENV === "development" ? { rejectUnauthorized: false } : { rejectUnauthorized: false }
});

