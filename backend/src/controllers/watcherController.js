// src/controllers/watcherController.js
import { ok, fail } from "../utils/response.js";
import {
  getWatchers,
  addWatcher,
  removeWatcher
} from "../services/watcherService.js";
import { log } from "../utils/logger.js";

const DEFAULT_USER_ID = 1;

/**
 * GET /api/watchers
 */
export async function listWatchers(req, res) {
  try {
    const watchers = await getWatchers(DEFAULT_USER_ID);
    return res.json(ok(watchers));
  } catch (err) {
    log.error(`[WATCHERS] list error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}

/**
 * POST /api/watchers
 */
export async function createWatcher(req, res) {
  try {
    const { ssn, licenceId, cityid, email } = req.body;

    if (!ssn || !licenceId || !cityid || !email) {
      return res.json(fail("Missing required fields"));
    }

    const w = await addWatcher(
      DEFAULT_USER_ID,
      ssn,
      Number(licenceId),
      Number(cityid),
      email
    );

    return res.json(ok(w));
  } catch (err) {
    log.error(`[WATCHERS] create error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}

/**
 * DELETE /api/watchers/:id
 */
export async function deleteWatcher(req, res) {
  try {
    const id = req.params.id;           
    const { email, cityid, userId } = req.body;

    await removeWatcher(
      userId ?? DEFAULT_USER_ID,
      id,
      email,
      cityid
    );

    return res.json(ok("Deleted"));
  } catch (err) {
    log.error(`[WATCHERS] delete error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}
