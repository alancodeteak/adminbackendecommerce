import { withClient, withTx } from "../../../infra/db/tx.js";
import { ShopsRepoPg } from "../../../adapters/repositories/postgres/ShopsRepoPg.js";
import { listShops as listShopsUcFactory } from "../../../application/usecases/superadmin/shops/listShops.js";
import { getShop as getShopUcFactory } from "../../../application/usecases/superadmin/shops/getShop.js";
import { createShop as createShopUcFactory } from "../../../application/usecases/superadmin/shops/createShop.js";
import { uploadShopImage as uploadShopImageUcFactory } from "../../../application/usecases/superadmin/shops/uploadShopImage.js";
import { publicUrlForStorageKey } from "../../../infra/media/publicMediaUrl.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";

const shopsRepo = new ShopsRepoPg();
const listShopsUc = listShopsUcFactory({ shopsRepo });
const getShopUc = getShopUcFactory({ shopsRepo });
const createShopUc = createShopUcFactory({ shopsRepo });
const uploadShopImageUc = uploadShopImageUcFactory({ shopsRepo });

export async function list(req, res, next) {
  try {
    const result = await withClient(async (client) => {
      return await listShopsUc(client, req.query);
    });

    const total = result.total;
    const page = req.query.page;
    const limit = req.query.limit;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      success: true,
      data: {
        shops: result.rows.map((r) => {
          const key = r.shop_image;
          const shop_image_url = publicUrlForStorageKey(key);
          return {
            id: r.id,
            name: r.name,
            shop_image: key,
            shop_image_url: shop_image_url || null,
            contact_number: r.contact_number
          };
        }),
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

function serializeShopDetail(shop) {
  const imageKey = shop.shop_image;
  const shopImageUrl = publicUrlForStorageKey(imageKey);

  return {
    id: shop.id,
    slug: shop.slug,
    name: shop.name,
    customDomain: shop.custom_domain,
    isActive: shop.is_active,
    status: shop.status,
    isBlocked: shop.is_blocked,
    isDeleted: shop.is_deleted,
    phone: shop.phone,
    email: shop.email,
    addressId: shop.shop_address_id,
    ownerUserId: shop.owner_user_id,
    address: shop.address_row_id
      ? {
          id: shop.address_row_id,
          line1: shop.line1,
          line2: shop.line2,
          landmark: shop.landmark,
          city: shop.city,
          state: shop.state,
          postalCode: shop.postal_code,
          country: shop.country,
          lat: shop.lat,
          lng: shop.lng,
          raw: shop.address_raw,
          createdAt: shop.address_created_at,
          updatedAt: shop.address_updated_at
        }
      : null,
    image: imageKey
      ? {
          mediaAssetId: shop.media_asset_id,
          storageKey: imageKey,
          contentType: shop.shop_image_content_type,
          byteSize: shop.shop_image_byte_size,
          sha256: shop.media_sha256,
          url: shopImageUrl || null
        }
      : null,
    createdAt: shop.created_at,
    updatedAt: shop.updated_at,
    deletedAt: shop.deleted_at
  };
}

export async function get(req, res, next) {
  try {
    const shop = await withClient(async (client) => {
      return await getShopUc(client, req.params);
    });

    if (!shop) throw new NotFoundError("Shop not found");

    res.json({
      success: true,
      data: {
        shop: serializeShopDetail(shop)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const shop = await withTx(async (client) => {
      return await createShopUc(client, req.body);
    });
    res.status(201).json({
      success: true,
      data: {
        shop
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(req, res, next) {
  try {
    const result = await withTx(async (client) => {
      return await uploadShopImageUc(client, { shopId: req.params.id, file: req.file });
    });
    res.status(201).json({
      success: true,
      data: {
        image: result
      }
    });
  } catch (err) {
    next(err);
  }
}

