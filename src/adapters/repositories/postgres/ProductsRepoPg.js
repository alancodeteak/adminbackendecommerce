import { ProductsRepo } from "../../../application/ports/repositories/ProductsRepo.js";

export class ProductsRepoPg extends ProductsRepo {
  async list(client, { status, categoryId, q, limit, offset }) {
    const where = [];
    const values = [];

    if (status) {
      values.push(status);
      where.push(`status = $${values.length}`);
    }
    if (categoryId) {
      values.push(categoryId);
      where.push(`category_id = $${values.length}`);
    }
    if (q) {
      values.push(`%${q}%`);
      where.push(`name ilike $${values.length}`);
    }

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const sql = `
      select
        id,
        shop_id,
        category_id,
        name,
        slug,
        base_unit,
        status,
        price_minor_per_unit,
        created_at,
        updated_at
      from products
      ${where.length ? `where ${where.join(" and ")}` : ""}
      order by updated_at desc
      limit $${limitIdx} offset $${offsetIdx}
    `;

    const result = await client.query(sql, values);
    return result.rows;
  }
}

