// src/automation/apiClient.js
import fetch from "node-fetch";
import { getCookie, saveCookie } from "../services/cookieStore.js";
import { log } from "../utils/logger.js";

const BASE = "https://fp.trafikverket.se/Boka";

/**
 * Spara cookies från Set-Cookie headers
 */
async function saveCookies(userId, headers) {
  const setCookie = headers.raw()["set-cookie"];
  if (!setCookie) return;

  for (const h of setCookie) {
    const [pair] = h.split(";");
    const [name, value] = pair.split("=");

    if (!name || !value) continue;

    await saveCookie(userId, name.trim(), value.trim());
    log.info(`[COOKIE] ${name.trim()}=${value.trim()}`);
  }
}

/**
 * TRAFIKVERKET REQUEST WRAPPER
 */
export async function trafikverketRequest(userId, endpoint, body = null, extraHeaders = {}) {
  const cookieList = await getCookie(userId);
  if (!cookieList.length) {
    log.warn(`[TV] No cookies for user ${userId}`);
    return null;
  }

  const cookieHeader = cookieList.map(c => `${c.name}=${c.value}`).join("; ");

  const url = `${BASE}/${endpoint}`;
  const method = body ? "POST" : "GET";

  const headers = {
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": cookieHeader,
    "User-Agent": "Mozilla/5.0 (iPad)",
    ...extraHeaders
  };

  const options = { method, headers };

  // BODY LOGIC
  if (body === "null") {
    options.body = "null";
  } else if (body) {
    headers["Content-Type"] = "application/json; charset=UTF-8";
    options.body = JSON.stringify(body);
  }

  log.info(`[TV] ${method} ${endpoint}`);

  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    log.error(`[TV] Network error: ${err.message}`);
    return null;
  }

  await saveCookies(userId, response.headers);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    log.warn("[TV] Non-JSON → session dead");
    return null;
  }

  try {
    return await response.json();
  } catch (err) {
    log.error(`[TV] JSON error: ${err.message}`);
    return null;
  }
}
