import { ShopsRepo } from "../../../application/ports/repositories/ShopsRepo.js";

export class ShopsRepoPg extends ShopsRepo {
  async list(client, { q, status, isActive, limit, offset }) {
    const where = [];
    const values = [];

    if (status) {
      values.push(status);
      where.push(`status = $${values.length}`);
    }
    if (isActive !== undefined) {
      values.push(isActive);
      where.push(`is_active = $${values.length}`);
    }
    if (q) {
      values.push(`%${q}%`);
      const idx = values.length;
      where.push(`(name ilike $${idx} or slug ilike $${idx})`);
    }

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const sql = `
      select
        id,
        slug,
        name,
        custom_domain,
        is_active,
        status,
        created_at,
        updated_at
      from shops
      ${where.length ? `where ${where.join(" and ")}` : ""}
      order by created_at desc
      limit $${limitIdx} offset $${offsetIdx}
    `;

    const result = await client.query(sql, values);
    return result.rows;
  }

  async getById(client, id) {
    const result = await client.query(
      `select
        id,
        slug,
        name,
        custom_domain,
        is_active,
        status,
        phone,
        email,
        address,
        location,
        owner_user_id,
        timelines,
        actions,
        created_at,
        updated_at
      from shops
      where id = $1
      limit 1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

