import { AuthRepo } from "../../../application/ports/repositories/AuthRepo.js";

export class AuthRepoPg extends AuthRepo {
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
      `select id, user_id, is_active
       from superadmins
       where user_id = $1 and is_active = true
       limit 1`,
      [userId]
    );
    return result.rows[0] || null;
  }
}

