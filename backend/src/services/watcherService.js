// src/services/watcherService.js
import { db } from "../utils/db.js";
import { log } from "../utils/logger.js";

/**
 * Hämta watchers
 */
export async function getWatchers(userId) {
  const res = await db.query(
    `SELECT * FROM watchers WHERE user_id=$1 ORDER BY id ASC`,
    [userId]
  );
  return res.rows;
}

/**
 * Skapa watcher
 */
export async function addWatcher(userId, ssn, licenceId, cityid, email) {
  const result = await db.query(
    `INSERT INTO watchers (user_id, ssn, licenceid, cityid, email)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [userId, ssn, licenceId, cityid, email]
  );

  log.info(`[WATCHER-SERVICE] Watcher created for user ${userId}`);
  return result.rows[0];
}

/**
 * Ta bort watcher
 */
export async function removeWatcher(userId, id, email, cityid) {
  // 1. Delete by watcher ID
  if (id && !email && !cityid) {
    await db.query(
      `DELETE FROM watchers WHERE user_id=$1 AND id=$2`,
      [userId, id]
    );
    log.info(`[WATCHER-SERVICE] Deleted watcher id=${id}`);
    return;
  }

  // 2. Delete all watchers for this user
  if (!id && userId && !email && !cityid) {
    await db.query(
      `DELETE FROM watchers WHERE user_id=$1`,
      [userId]
    );
    log.info(`[WATCHER-SERVICE] Deleted ALL watchers for user=${userId}`);
    return;
  }

  // 3. Delete by email only
  if (email && !id && !cityid) {
    await db.query(
      `DELETE FROM watchers WHERE email=$1`,
      [email]
    );
    log.info(`[WATCHER-SERVICE] Deleted watchers for email=${email}`);
    return;
  }

  // 4. Delete by user + city
  if (userId && cityid && !email && !id) {
    await db.query(
      `DELETE FROM watchers WHERE user_id=$1 AND cityid=$2`,
      [userId, cityid]
    );
    log.info(`[WATCHER-SERVICE] Deleted watchers for user=${userId} city=${cityid}`);
    return;
  }

  // 5. Delete by user + email + city
  if (userId && email && cityid && !id) {
    await db.query(
      `DELETE FROM watchers WHERE user_id=$1 AND email=$2 AND cityid=$3`,
      [userId, email, cityid]
    );
    log.info(`[WATCHER-SERVICE] Deleted specific watchers`);
    return;
  }

  throw new Error("No valid delete conditions");
}

/**
 * Uppdatera senaste tider i DB
 */
export async function updateWatcherState(watcherId, times) {
  await db.query(
    `UPDATE watchers SET last_times=$1 WHERE id=$2`,
    [JSON.stringify(times), watcherId]
  );
}

/**
 * Hämta sparade tider
 */
export async function getWatcherState(watcherId) {
  const res = await db.query(
    `SELECT last_times FROM watchers WHERE id=$1`,
    [watcherId]
  );

  return res.rows[0]?.last_times || [];
}
