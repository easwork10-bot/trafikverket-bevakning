// src/services/notifier.js
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import { log } from "../utils/logger.js";

if (!process.env.RESEND_API_KEY) {
  log.error("[NOTIFIER] RESEND_API_KEY missing!");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html) {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    return { ok: false, error: "EMAIL_FROM missing" };
  }

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.info(`[NOTIFIER] Sending mail to ${to} (attempt ${attempt})`);

      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      log.info(`[NOTIFIER] Mail sent to ${to}`);
      return { ok: true };

    } catch (err) {
      const message = err?.message || "Unknown error";
      log.warn(`[NOTIFIER] Resend error ${attempt}: ${message}`);

      if (attempt === maxRetries) {
        log.error("[NOTIFIER] Mail failed after 3 retries");
        return { ok: false, error: message };
      }

      // simple backoff
      await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
}
