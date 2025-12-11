// src/services/notifier.js
import dotenv from "dotenv";
dotenv.config();
import sgMail from "@sendgrid/mail";
import { log } from "../utils/logger.js";

if (!process.env.SENDGRID_API_KEY) {
  log.error("[NOTIFIER] SENDGRID_API_KEY missing!");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, html) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html
  };

  if (!msg.from) {
    return { ok: false, error: "EMAIL_FROM missing" };
  }

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.info(`[NOTIFIER] Sending mail to ${to} (attempt ${attempt})`);
      await sgMail.send(msg, { timeout: 8000 });
      log.info(`[NOTIFIER] Mail sent to ${to}`);
      return { ok: true };
    } catch (err) {
      const message = err?.response?.body || err.message;
      log.warn(`[NOTIFIER] SendGrid error ${attempt}: ${message}`);

      if (attempt === maxRetries) {
        log.error("[NOTIFIER] Mail failed after 3 retries");
        return { ok: false, error: message };
      }

      await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
}
