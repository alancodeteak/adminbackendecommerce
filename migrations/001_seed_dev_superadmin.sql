-- Dev seed: create one superadmin user + superadmin record.
-- Idempotent: safe to run multiple times.
--
-- Usage:
--   psql "$DATABASE_URL" -f backend/migrations/000_unified_schema.sql
--   psql "$DATABASE_URL" -f backend/migrations/001_seed_dev_superadmin.sql
--
-- IMPORTANT:
-- - Replace password_hash with a bcrypt hash produced by your app's hasher.
-- - Do NOT commit real credentials for production.

DO $$
DECLARE
  v_email TEXT := 'superadmin@example.com';
  v_user_id UUID;
BEGIN
  -- Create user if missing.
  SELECT id INTO v_user_id FROM users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    INSERT INTO users (email, password_hash, is_active)
    VALUES (
      v_email,
      '$2b$10$REPLACE_ME_WITH_REAL_BCRYPT_HASH___________________________',
      true
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Create superadmin record if missing.
  IF NOT EXISTS (SELECT 1 FROM superadmins WHERE user_id = v_user_id) THEN
    INSERT INTO superadmins (user_id, is_active) VALUES (v_user_id, true);
  END IF;
END $$;

