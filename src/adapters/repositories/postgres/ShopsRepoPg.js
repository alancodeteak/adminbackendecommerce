import { ShopsRepo } from "../../../application/ports/repositories/ShopsRepo.js";
import { ConflictError } from "../../../domain/errors/ConflictError.js";

function addressHasContent(a) {
  if (!a || typeof a !== "object") return false;
  return Object.values(a).some((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "number") return true;
    return String(v).trim() !== "";
  });
}

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

  async updateShop(client, shopId, patch) {
    const cur = await client.query(`select address_id from shops where id = $1`, [shopId]);
    if (!cur.rows[0]) return null;
    let addressId = cur.rows[0].address_id;

    if (patch.address !== undefined) {
      const a = patch.address;
      if (addressId) {
        await client.query(
          `update addresses set
            line1 = $1, line2 = $2, landmark = $3, city = $4, state = $5,
            postal_code = $6, country = $7, lat = $8, lng = $9, raw = $10,
            updated_at = now()
          where id = $11`,
          [
            a.line1 ?? null,
            a.line2 ?? null,
            a.landmark ?? null,
            a.city ?? null,
            a.state ?? null,
            a.postal_code ?? null,
            a.country ?? null,
            a.lat ?? null,
            a.lng ?? null,
            a.raw ?? null,
            addressId
          ]
        );
      } else if (addressHasContent(a)) {
        const ins = await client.query(
          `insert into addresses (line1, line2, landmark, city, state, postal_code, country, lat, lng, raw)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
          [
            a.line1 ?? null,
            a.line2 ?? null,
            a.landmark ?? null,
            a.city ?? null,
            a.state ?? null,
            a.postal_code ?? null,
            a.country ?? null,
            a.lat ?? null,
            a.lng ?? null,
            a.raw ?? null
          ]
        );
        addressId = ins.rows[0].id;
        await client.query(`update shops set address_id = $1, updated_at = now() where id = $2`, [
          addressId,
          shopId
        ]);
      }
    }

    const fragments = [];
    const vals = [];
    let p = 1;
    const eq = (col, val) => {
      fragments.push(`${col} = $${p}`);
      vals.push(val);
      p += 1;
    };

    if (patch.name !== undefined) eq("name", patch.name);
    if (patch.slug !== undefined) eq("slug", patch.slug);
    if (patch.customDomain !== undefined) eq("custom_domain", patch.customDomain);
    if (patch.phone !== undefined) eq("phone", patch.phone);
    if (patch.email !== undefined) eq("email", patch.email);
    if (patch.ownerUserId !== undefined) eq("owner_user_id", patch.ownerUserId);
    if (patch.isActive !== undefined) eq("is_active", patch.isActive);
    if (patch.status !== undefined) eq("status", patch.status);
    if (patch.isBlocked !== undefined) eq("is_blocked", patch.isBlocked);
    if (patch.isDeleted !== undefined) {
      eq("is_deleted", patch.isDeleted);
      fragments.push(
        patch.isDeleted ? "deleted_at = coalesce(deleted_at, now())" : "deleted_at = null"
      );
    }

    const touchedAddress = patch.address !== undefined;
    if (fragments.length > 0) {
      fragments.push("updated_at = now()");
      vals.push(shopId);
      try {
        await client.query(
          `update shops set ${fragments.join(", ")} where id = $${p}`,
          vals
        );
      } catch (err) {
        if (err?.code === "23505") {
          const c = String(err?.constraint || "");
          if (c.includes("slug")) throw new ConflictError("Shop slug already exists");
          if (c.includes("custom_domain")) throw new ConflictError("Shop custom domain already exists");
          throw new ConflictError("Shop update conflicts with existing record");
        }
        throw err;
      }
    } else if (touchedAddress) {
      await client.query(`update shops set updated_at = now() where id = $1`, [shopId]);
    }

    return this.getById(client, shopId);
  }

  /**
   * Binds shop primary image via `entity_images` (entity_type = shop, entity_id = shop id)
   * and links `media_assets`. Requires tenant context for RLS on `entity_images`.
   */
  async upsertShopEntityImage(client, { shopId, media }) {
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

    const eiRes = await client.query(
      `insert into entity_images (shop_id, entity_type, entity_id, media_asset_id)
       values ($1, 'shop', $1, $2)
       on conflict (shop_id, entity_type, entity_id) do update
       set media_asset_id = excluded.media_asset_id, updated_at = now()
       returning id, shop_id, entity_type, entity_id, media_asset_id, created_at, updated_at`,
      [shopId, mediaAssetId]
    );
    const row = eiRes.rows[0];

    return {
      mediaAssetId,
      entityImage: {
        id: row.id,
        shopId: row.shop_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        mediaAssetId: row.media_asset_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    };
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

