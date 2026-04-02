import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

export async function sendOtpEmail({ to, otp, purpose = "superadmin_login" }) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.OTP_FROM_EMAIL) {
    throw new Error("SMTP/OTP_FROM_EMAIL env vars are not configured");
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  const subject = "Your OTP Code";
  const text = `Your one-time password (OTP) is: ${otp}\n\nPurpose: ${purpose}\nExpires in ${env.OTP_TTL_MINUTES} minutes.`;

  await transport.sendMail({
    from: env.OTP_FROM_EMAIL,
    to,
    subject,
    text
  });
}

