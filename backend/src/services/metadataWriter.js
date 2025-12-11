// src/services/metadataWriter.js
import fs from "fs/promises";
import path from "path";
import { log } from "../utils/logger.js";

const META_DIR = path.join(process.cwd(), "src", "meta");

/**
 * Säkerställ att meta-mappen finns.
 */
async function ensureMetaDir() {
  try {
    await fs.mkdir(META_DIR, { recursive: true });
  } catch (err) {
    log.error(`[META] Failed to create meta directory: ${err.message}`);
  }
}

/**
 * Skriv JSON till fil – endast om datan har ändrats.
 * Använder atomisk skrivning för att undvika korrupta filer.
 */
async function writeJsonSafely(filename, data) {
  if (!Array.isArray(data) || data.length === 0) {
    log.warn(`[META] ${filename} → Skipped (empty or invalid data)`);
    return;
  }

  const fullPath = path.join(META_DIR, filename);

  try {
    // Läs gammal fil (om den finns)
    let oldContent = null;
    try {
      oldContent = await fs.readFile(fullPath, "utf8");
    } catch {
      /* ignore missing file */
    }

    const newContent = JSON.stringify(data, null, 2);

    // Skriv endast om innehållet ändrats
    if (oldContent === newContent) {
      log.info(`[META], ${filename} unchanged → skipping write`);
      return;
    }

    // Atomisk skrivning via temporär fil
    const tmpPath = fullPath + ".tmp";
    await fs.writeFile(tmpPath, newContent);
    await fs.rename(tmpPath, fullPath);

    log.info(`[META]Updated ${filename} (${data.length} items)`);

  } catch (err) {
    log.error(`"[META] Failed writing ${filename}: ${err.message}`);
  }
}

/**
 * Publik metod som tar emot metadata från search-information
 */
export async function saveMetadata({ licences, examTypes, locations }) {
  await ensureMetaDir();

  if (licences) {
    await writeJsonSafely("licenceTypes.json", licences);
  }

  if (examTypes) {
    await writeJsonSafely("examTypes.json", examTypes);
  }

  if (locations) {
    await writeJsonSafely("locations.json", locations);
  }
}
