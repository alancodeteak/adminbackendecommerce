import { OtpRepo } from "../../../application/ports/repositories/OtpRepo.js";

export class OtpRepoPg extends OtpRepo {
  async getLatestUnusedOtpByEmailAndPurpose(client, email, purpose) {
    const result = await client.query(
      `select
        id,
        user_id,
        email,
        purpose,
        otp_hash,
        expires_at,
        used_at,
        attempts,
        created_at
       from auth_otps
       where email = $1
         and purpose = $2
         and used_at is null
         and expires_at > now()
       order by created_at desc
       limit 1`,
      [email, purpose]
    );
    return result.rows[0] || null;
  }

  async createOtp(client, { userId, email, purpose, otpHash, expiresAt }) {
    const result = await client.query(
      `insert into auth_otps (user_id, email, purpose, otp_hash, expires_at)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [userId, email, purpose, otpHash, expiresAt]
    );
    return result.rows[0]?.id ?? null;
  }

  async markOtpUsed(client, otpId) {
    await client.query(`update auth_otps set used_at = now() where id = $1`, [otpId]);
  }

  async incrementOtpAttempts(client, otpId) {
    await client.query(
      `update auth_otps
       set attempts = attempts + 1
       where id = $1`,
      [otpId]
    );
  }
}

