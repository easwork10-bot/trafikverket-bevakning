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
  //  Safety check — never allow deletes without a user
  if (!userId) {
    throw new Error("userId is required to delete watchers");
  }

  /**
   * 1 MOST SPECIFIC
   * Delete a single watcher by ID
   * This is the safest delete operation.
   */
  if (id) {
    await db.query(
      `DELETE FROM watchers
       WHERE user_id = $1 AND id = $2`,
      [userId, id]
    );
    return;
  }

  /**
   * 2 Delete watchers for a user by email AND city
   * Used when frontend knows exactly which watcher group to remove.
   */
  if (email && cityid) {
    await db.query(
      `DELETE FROM watchers
       WHERE user_id = $1
         AND email = $2
         AND cityid = $3`,
      [userId, email, cityid]
    );
    return;
  }

  /**
   * 3 Delete all watchers for a user in a specific city
   * Example: user removes monitoring for a city.
   */
  if (cityid) {
    await db.query(
      `DELETE FROM watchers
       WHERE user_id = $1
         AND cityid = $2`,
      [userId, cityid]
    );
    return;
  }

  /**
   * 4 Delete all watchers for a user tied to an email
   * Example: user removes an email subscription.
   */
  if (email) {
    await db.query(
      `DELETE FROM watchers
       WHERE user_id = $1
         AND email = $2`,
      [userId, email]
    );
    return;
  }

  /**
   * ❌ No valid delete combination provided
   * We FAIL HARD instead of guessing.
   */
  throw new Error("No valid delete conditions provided");
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
