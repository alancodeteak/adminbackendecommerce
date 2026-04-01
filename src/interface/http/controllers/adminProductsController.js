import { withTx } from "../../../infra/db/tx.js";
import { setTenantContext } from "../../../infra/db/tenantContext.js";
import { ProductsRepoPg } from "../../../adapters/repositories/postgres/ProductsRepoPg.js";
import { listProducts } from "../../../application/usecases/admin/products/listProducts.js";

const productsRepo = new ProductsRepoPg();
const listProductsUc = listProducts({ productsRepo });

export async function list(req, res, next) {
  try {
    const { shopId } = req.auth;
    const rows = await withTx(async (client) => {
      await setTenantContext(client, shopId);
      return await listProductsUc(client, req.query);
    });
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

