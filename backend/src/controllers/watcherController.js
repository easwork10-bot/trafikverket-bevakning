// src/controllers/watcherController.js
import { ok, fail } from "../utils/response.js";
import {
  getWatchers,
  addWatcher,
  removeWatcher
} from "../services/watcherService.js";
import { log } from "../utils/logger.js";

/**
 * GET /api/watchers?userId=1
 */
export async function listWatchers(req, res) {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.json(fail("userId is required"));
    }

    const watchers = await getWatchers(userId);
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
    const { userId, ssn, licenceId,examinationTypeId, cityid, email } = req.body;

    if (!userId || !ssn || !licenceId ||!examinationTypeId || !cityid || !email) {
      return res.json(fail("Missing required fields"));
    }

    const watcher = await addWatcher(
      Number(userId),
      ssn,
      Number(licenceId),
      Number(examinationTypeId),
      Number(cityid),
      email
    );

    return res.json(ok(watcher));

  } catch (err) {
    log.error(`[WATCHERS] create error: ${err.message}`);
    return res.json(fail("Internal error"));
  }
}

/**
 * DELETE /api/watchers/:id?
 */
export async function deleteWatcher(req, res) {
  try {
    const id = req.params.id ? Number(req.params.id) : null;
    const { userId, email, cityid } = req.body;

    if (!userId) {
      return res.json(fail("userId is required"));
    }

    await removeWatcher(
      Number(userId),
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
