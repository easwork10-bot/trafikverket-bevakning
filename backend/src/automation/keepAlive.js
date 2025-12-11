// src/automation/keepAlive.js
import { trafikverketRequest } from "./apiClient.js";
import { log } from "../utils/logger.js";

export async function keepAlive(userId) {
  log.info(`[KEEPALIVE] Sending keep-alive for user=${userId}`);

  const res = await trafikverketRequest(
    userId,
    "is-system-updating",
    "null",
    { "Content-Type": "text/plain" }
  );

  if (!res) {
    log.warn("[KEEPALIVE] No response → session dead");
    return { ok: false };
  }

  log.info("[KEEPALIVE] Session alive");
  return { ok: true };
}
