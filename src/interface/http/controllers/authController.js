import { withClient } from "../../../infra/db/tx.js";
import { loginStaff } from "../../../application/usecases/admin/auth/loginStaff.js";
import { AuthRepoPg } from "../../../adapters/repositories/postgres/AuthRepoPg.js";

const authRepo = new AuthRepoPg();
const loginStaffUc = loginStaff({ authRepo });

export async function login(req, res, next) {
  try {
    req.perf?.start("total_ms");
    const result = await withClient(async (client) => {
      client.perf = req.perf;
      return await loginStaffUc(client, req.body);
    });
    req.perf?.start("response_ms");
    res.json(result);
    req.perf?.end("response_ms");
    req.perf?.end("total_ms");

    const perf = req.perf?.getDurations();
    if (perf) {
      req.log?.info(
        {
          msg: "login perf",
          route: "/api/admin/auth/login",
          perf_ms: perf
        },
        "login perf"
      );
    }
  } catch (err) {
    next(err);
  }
}

