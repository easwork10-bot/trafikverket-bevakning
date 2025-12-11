// src/services/cookieStore.js
import { db } from "../utils/db.js";
import { log } from "../utils/logger.js";

/**
 * Hämta cookies som [{ name, value }]
 */
export async function getCookie(userId) {
  const res = await db.query(
    "SELECT data FROM cookies WHERE user_id=$1",
    [userId]
  );

  if (!res.rows.length) {
    log.warn(`[COOKIE] No cookies found for user ${userId}`);
    return [];
  }

  const data = res.rows[0].data;

  if (!Array.isArray(data)) {
    log.warn(`[COOKIE] Invalid cookie format for user ${userId}`);
    return [];
  }

  return data;
}

/**
 * Spara / uppdatera EN cookie (från Set-Cookie)
 */
export async function saveCookie(userId, name, value) {
  let cookies = await getCookie(userId);
  if (!Array.isArray(cookies)) cookies = [];

  const index = cookies.findIndex(c => c.name === name);

  if (index >= 0) {
    cookies[index].value = value;
  } else {
    cookies.push({ name, value });
  }

  await db.query(
    `INSERT INTO cookies (user_id, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET data=$2::jsonb`,
    [userId, JSON.stringify(cookies)]
  );

  log.info(`[COOKIE] Updated cookie: ${name}=${value}`);
}

/**
 * Ersätt ALLA cookies efter login (Playwright)
 */
export async function replaceAllCookies(userId, cookiesArray) {
  if (!Array.isArray(cookiesArray)) {
    log.error(`[COOKIE] replaceAllCookies: non-array input`);
    return;
  }

  // Playwright cookie format -> simple {name, value}
  const filtered = cookiesArray
    .filter(c => c.name && c.value)
    .map(c => ({
      name: c.name,
      value: c.value
    }));

  await db.query(
    `INSERT INTO cookies (user_id, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET data=$2::jsonb`,
    [userId, JSON.stringify(filtered)]
  );

  log.info(`[COOKIE] Replaced ALL cookies (${filtered.length})`);
}

/**
 * Returnera expiry från LoginValid
 */
export function getCookieExpiry(cookies) {
  if (!Array.isArray(cookies)) return null;

  const loginCookie = cookies.find(
    c => c.name.toLowerCase() === "loginvalid"
  );

  if (!loginCookie?.value) return null;

  try {
    return new Date(loginCookie.value);
  } catch {
    return null;
  }
}
