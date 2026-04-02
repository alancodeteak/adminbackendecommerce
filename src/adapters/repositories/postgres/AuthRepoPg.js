import { AuthRepo } from "../../../application/ports/repositories/AuthRepo.js";

export class AuthRepoPg extends AuthRepo {
  async getStaffLoginContextByShopSlugAndEmail(client, { shopSlug, email }) {
    const result = await client.query(
      `select
        s.id as shop_id,
        s.slug as shop_slug,
        s.name as shop_name,
        s.is_active as shop_is_active,
        s.status as shop_status,
        u.id as user_id,
        u.email,
        u.password_hash,
        u.is_active as user_is_active,
        ss.role as staff_role,
        ss.is_active as staff_is_active,
        ss.status as staff_status
       from shops s
       cross join lateral (
         select set_config('app.current_shop_id', s.id::text, true)
       ) as tenant
       join shop_staff ss
         on ss.shop_id = s.id
       join users u
         on u.id = ss.user_id
       where s.slug = $1
         and u.email = $2
       limit 1`,
      [shopSlug, email]
    );
    return result.rows[0] || null;
  }

  async getShopBySlug(client, slug) {
    const result = await client.query(
      "select id, slug, name, is_active, status from shops where slug = $1 limit 1",
      [slug]
    );
    return result.rows[0] || null;
  }

  async getUserByEmail(client, email) {
    const result = await client.query(
      "select id, email, password_hash, is_active from users where email = $1 limit 1",
      [email]
    );
    return result.rows[0] || null;
  }

  async getActiveStaffRole(client, shopId, userId) {
    // shop_staff is protected by RLS; set tenant context first.
    await client.query("select set_config('app.current_shop_id', $1, true)", [shopId]);
    const result = await client.query(
      `select role
       from shop_staff
       where shop_id = $1
         and user_id = $2
         and is_active = true
         and status = 'active'
       limit 1`,
      [shopId, userId]
    );
    return result.rows[0]?.role ?? null;
  }

  async getActiveSuperadmin(client, userId) {
    const result = await client.query(
      `select
        id,
        user_id,
        is_active,
        otp_hash,
        otp_expires_at,
        otp_used_at,
        otp_attempts,
        otp_last_sent_at,
        created_at
       from superadmins
       where user_id = $1 and is_active = true
       limit 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async setSuperadminOtp(client, { userId, otpHash, expiresAt }) {
    await client.query(
      `update superadmins
       set
         otp_hash = $2,
         otp_expires_at = $3,
         otp_used_at = null,
         otp_attempts = 0,
         otp_last_sent_at = now()
       where user_id = $1`,
      [userId, otpHash, expiresAt]
    );
  }

  async markSuperadminOtpUsed(client, userId) {
    await client.query(
      `update superadmins
       set otp_used_at = now()
       where user_id = $1`,
      [userId]
    );
  }

  async incrementSuperadminOtpAttempts(client, userId) {
    await client.query(
      `update superadmins
       set otp_attempts = otp_attempts + 1
       where user_id = $1`,
      [userId]
    );
  }
}

