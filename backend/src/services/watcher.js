import { db } from "../utils/db.js";
import { fetchTimes } from "../automation/fetchTimes.js";
import { sendEmail } from "./notifier.js";
import { log } from "../utils/logger.js";

function getRandomInterval() {
  const base = 10 * 60 * 1000;
  const offset = (Math.random() * 6 - 3) * 60 * 1000;
  return base + offset;
}

export function startWatcher() {
  async function run() {
    log("Watcher running with new Trafikverket API...");

    const { rows: watchers } = await db.query(`
      SELECT user_id, email, cityId, licenceId, ssn
      FROM watchers
    `);

    for (const w of watchers) {
      const result = await fetchTimes(w);
      if (!result) continue;

      const bundles = result?.occasionBundle ?? [];

      if (bundles.length > 0) {
        await sendEmail(
          w.email,
          "Lediga tider hittade",
          `<p>Det finns lediga tider!</p>`
        );
      }
    }

    setTimeout(run, getRandomInterval());
  }

  run();
}
