import { withTx } from "../../../infra/db/tx.js";
import { ShopsRepoPg } from "../../../adapters/repositories/postgres/ShopsRepoPg.js";
import { listShops as listShopsUcFactory } from "../../../application/usecases/superadmin/shops/listShops.js";
import { getShop as getShopUcFactory } from "../../../application/usecases/superadmin/shops/getShop.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";

const shopsRepo = new ShopsRepoPg();
const listShopsUc = listShopsUcFactory({ shopsRepo });
const getShopUc = getShopUcFactory({ shopsRepo });

export async function list(req, res, next) {
  try {
    const rows = await withTx(async (client) => {
      return await listShopsUc(client, req.query);
    });

    res.json({
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        customDomain: r.custom_domain,
        isActive: r.is_active,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      })),
      page: { limit: req.query.limit, offset: req.query.offset }
    });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const shop = await withTx(async (client) => {
      return await getShopUc(client, req.params);
    });

    if (!shop) throw new NotFoundError("Shop not found");

    res.json({
      shop: {
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        customDomain: shop.custom_domain,
        isActive: shop.is_active,
        status: shop.status,
        createdBySuperadminUserId: shop.created_by_superadmin_user_id,
        approvedAt: shop.approved_at,
        blockedReason: shop.blocked_reason,
        createdAt: shop.created_at,
        updatedAt: shop.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
}

