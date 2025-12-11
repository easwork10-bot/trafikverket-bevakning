// src/controllers/authController.js
import { ok, fail } from "../utils/response.js";
import { log } from "../utils/logger.js";
import { getCookie, getCookieExpiry } from "../services/cookieStore.js";
import { performLogin } from "../automation/login.js";

const DEFAULT_USER_ID = 1;

/**
 * GET /api/auth/session
 */
export async function sessionStatus(req, res) {
  try {
    const cookies = await getCookie(DEFAULT_USER_ID);
    const expiresAt = getCookieExpiry(cookies);

    return res.json(
      ok({
        loggedIn: !!expiresAt,
        expiresAt
      })
    );
  } catch (err) {
    log.error(`[AUTH] sessionStatus error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}

/**
 * POST /api/auth/login
 * startar Playwright login
 */
export async function login(req, res) {
  try {
    const { userId } = req.body;
    const id = Number(userId || DEFAULT_USER_ID);

    const done = await performLogin(id);

    if (!done) {
      return res.json(fail("Login failed"));
    }

    return res.json(ok("Login completed"));
  } catch (err) {
    log.error(`[AUTH] login error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}
