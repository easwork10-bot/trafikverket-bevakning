import fs from "fs/promises";
import path from "path";

const META_DIR = path.join(process.cwd(), "src", "meta");

async function readJson(filename) {
  const fullPath = path.join(META_DIR, filename);
  try {
    const raw = await fs.readFile(fullPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getAllMeta() {
  const [licences, examTypes, locations] = await Promise.all([
    readJson("licenceTypes.json"),
    readJson("examTypes.json"),
    readJson("locations.json"),
  ]);
  console.log(
    "[META SERVICE] loaded",
    licences.length,
    examTypes.length,
    locations.length
  );

  return {
    licences,
    examTypes,
    locations,
  };
}
