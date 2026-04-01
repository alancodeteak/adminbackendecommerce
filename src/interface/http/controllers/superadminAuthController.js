import { withTx } from "../../../infra/db/tx.js";
import { AuthRepoPg } from "../../../adapters/repositories/postgres/AuthRepoPg.js";
import { loginSuperadmin as loginSuperadminUcFactory } from "../../../application/usecases/superadmin/auth/loginSuperadmin.js";

const authRepo = new AuthRepoPg();
const loginSuperadminUc = loginSuperadminUcFactory({ authRepo });

export async function loginSuperadmin(req, res, next) {
  try {
    const result = await withTx(async (client) => {
      return await loginSuperadminUc(client, req.body);
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

