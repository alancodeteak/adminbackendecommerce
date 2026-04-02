import { ShopsRepo } from "../../../application/ports/repositories/ShopsRepo.js";
import { ConflictError } from "../../../domain/errors/ConflictError.js";

export class ShopsRepoPg extends ShopsRepo {
  async list(client, { search, limit, offset }) {
    const where = ["s.is_active = true"];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      where.push(`s.name ilike $${values.length}`);
    }

    const whereSql = `where ${where.join(" and ")}`;

    const countResult = await client.query(
      `
      select count(*)::int as total
      from shops s
      ${whereSql}
      `,
      values
    );
    const total = countResult.rows[0]?.total ?? 0;

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const result = await client.query(
      `
      select
        s.id,
        s.name,
        ma.storage_key as shop_image,
        s.phone as contact_number
      from shops s
      left join entity_images ei
        on ei.shop_id = s.id
       and ei.entity_type = 'shop'
       and ei.entity_id = s.id
      left join media_assets ma
        on ma.id = ei.media_asset_id
      ${whereSql}
      order by s.created_at desc
      limit $${limitIdx} offset $${offsetIdx}
      `,
      values
    );

    return { rows: result.rows, total };
  }

  async create(client, { slug, name, customDomain, phone, email, ownerUserId, address }) {
    let addressId = null;
    if (
      address &&
      Object.values(address).some((v) => {
        if (v === undefined || v === null) return false;
        if (typeof v === "number") return true;
        return String(v).trim() !== "";
      })
    ) {
      const addrRes = await client.query(
        `insert into addresses (
          line1, line2, landmark, city, state, postal_code, country, lat, lng, raw
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        returning id`,
        [
          address.line1 ?? null,
          address.line2 ?? null,
          address.landmark ?? null,
          address.city ?? null,
          address.state ?? null,
          address.postal_code ?? null,
          address.country ?? null,
          address.lat ?? null,
          address.lng ?? null,
          address.raw ?? null
        ]
      );
      addressId = addrRes.rows[0]?.id ?? null;
    }

    try {
      const result = await client.query(
        `insert into shops (
          slug, name, custom_domain, phone, email, address_id, owner_user_id
        ) values (
          $1,$2,$3,$4,$5,$6,$7
        )
        returning id, slug, name`,
        [
          slug,
          name,
          customDomain ?? null,
          phone ?? null,
          email ?? null,
          addressId,
          ownerUserId ?? null
        ]
      );
      return result.rows[0];
    } catch (err) {
      if (err?.code === "23505") {
        const constraint = err?.constraint;
        if (constraint?.includes("shops_slug")) throw new ConflictError("Shop slug already exists");
        if (constraint?.includes("shops_custom_domain")) throw new ConflictError("Shop custom domain already exists");
        throw new ConflictError("Shop already exists");
      }
      throw err;
    }
  }

  async upsertShopImage(client, { shopId, media }) {
    // entity_images is protected by RLS; set tenant context to the shop.
    await client.query("select set_config('app.current_shop_id', $1, true)", [shopId]);

    const mediaRes = await client.query(
      `insert into media_assets (sha256, storage_key, content_type, byte_size)
       values ($1, $2, $3, $4)
       on conflict (sha256) do update set
         storage_key = excluded.storage_key,
         content_type = excluded.content_type,
         byte_size = excluded.byte_size
       returning id`,
      [media.sha256, media.storageKey, media.contentType, media.byteSize]
    );
    const mediaAssetId = mediaRes.rows[0].id;

    await client.query(
      `insert into entity_images (shop_id, entity_type, entity_id, media_asset_id)
       values ($1, 'shop', $1, $2)
       on conflict (shop_id, entity_type, entity_id) do update
       set media_asset_id = excluded.media_asset_id, updated_at = now()`,
      [shopId, mediaAssetId]
    );

    return { mediaAssetId };
  }

  async getById(client, id) {
    await client.query("select set_config('app.current_shop_id', $1, true)", [id]);
    const result = await client.query(
      `select
        s.id,
        s.slug,
        s.name,
        s.custom_domain,
        s.is_active,
        s.status,
        s.phone,
        s.email,
        s.address_id as shop_address_id,
        s.owner_user_id,
        s.is_blocked,
        s.is_deleted,
        s.created_at,
        s.updated_at,
        s.deleted_at,
        ma.id as media_asset_id,
        ma.sha256 as media_sha256,
        ma.storage_key as shop_image,
        ma.content_type as shop_image_content_type,
        ma.byte_size as shop_image_byte_size,
        a.id as address_row_id,
        a.line1,
        a.line2,
        a.landmark,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        a.lat,
        a.lng,
        a.raw as address_raw,
        a.created_at as address_created_at,
        a.updated_at as address_updated_at
      from shops s
      left join addresses a on a.id = s.address_id
      left join entity_images ei
        on ei.shop_id = s.id
       and ei.entity_type = 'shop'
       and ei.entity_id = s.id
      left join media_assets ma on ma.id = ei.media_asset_id
      where s.id = $1
      limit 1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

