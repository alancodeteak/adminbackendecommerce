import { withTx } from "../../../infra/db/tx.js";
import { loginStaff } from "../../../application/usecases/admin/auth/loginStaff.js";
import { AuthRepoPg } from "../../../adapters/repositories/postgres/AuthRepoPg.js";

const authRepo = new AuthRepoPg();
const loginStaffUc = loginStaff({ authRepo });

export async function login(req, res, next) {
  try {
    const result = await withTx(async (client) => {
      return await loginStaffUc(client, req.body);
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

