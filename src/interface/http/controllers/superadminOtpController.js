import { withTx } from "../../../infra/db/tx.js";
import { AuthRepoPg } from "../../../adapters/repositories/postgres/AuthRepoPg.js";
import { sendOtpEmail } from "../../../infra/email/sendOtpEmail.js";
import { requestSuperadminOtp } from "../../../application/usecases/superadmin/auth/requestSuperadminOtp.js";
import { verifySuperadminOtp } from "../../../application/usecases/superadmin/auth/verifySuperadminOtp.js";

const authRepo = new AuthRepoPg();

const requestUc = requestSuperadminOtp({ authRepo, sendOtpEmail });
const verifyUc = verifySuperadminOtp({ authRepo });

export async function requestOtp(req, res, next) {
  try {
    const result = await withTx(async (client) => {
      return await requestUc(client, req.body);
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await withTx(async (client) => {
      return await verifyUc(client, req.body);
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

