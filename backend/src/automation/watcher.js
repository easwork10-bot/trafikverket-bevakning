// src/automation/watcher.js
import { getTimes } from "../services/timesService.js";
import { getAllWatchers, updateWatcherState, getWatcherState } from "../services/watcherService.js";
import { keepAlive } from "./keepAlive.js";
import { sendEmail } from "../services/notifier.js";
import { log } from "../utils/logger.js";

function getSmartInterval() {
  const min = 10 * 60 * 1000;
  const max = 18 * 60 * 1000;
  return Math.floor(Math.random() * (max - min)) + min;
}

export function startWatcher() {
  async function loop() {
    log.info("[WATCHER] Cycle started");

    const watchers = await getAllWatchers();

for (const watch of watchers) {
  await processWatcher(watch);
}

    const next = getSmartInterval();
    log.info(`[WATCHER] Next run in ${Math.floor(next / 60000)} min`);

    setTimeout(loop, next);
  }

  loop();
}

async function processWatcher(watch) {
  const watcherId = watch.id;

  log.info(`[WATCHER] Processing watcher ${watcherId}`);

  // 1️⃣ Session alive?
  const alive = await keepAlive(watch.user_id);
  if (!alive.ok) {
    log.warn(`[WATCHER ${watcherId}] Session dead`);
    return;
  }

  // 2️⃣ Fetch times
  const times = await getTimes(
    watch.user_id,
    watch.ssn,
    watch.licenceid,
    watch.examinationtypeid,
    watch.cityid
  );

  if (!times.length) {
    log.info(`[WATCHER ${watcherId}] No times found`);
  }

  // 3️⃣ Compare with DB
  const previous = await getWatcherState(watcherId);
  const prevSet = new Set(previous.map(t => t.start));

  const newOnes = times.filter(t => !prevSet.has(t.start));

  // 4️⃣ Notify
  if (newOnes.length > 0) {
    log.info(`[WATCHER ${watcherId}] ${newOnes.length} NEW times`);

    const html = newOnes
      .map(t => new Date(t.start).toLocaleString("sv-SE"))
      .join("<br>");

    await sendEmail(
      watch.email,
      "🔥 Nya tider hos Trafikverket",
      html
    );
  }

  // 5️⃣ Update DB
  await updateWatcherState(watcherId, times);

  log.info(`[WATCHER ${watcherId}] Done`);
}
