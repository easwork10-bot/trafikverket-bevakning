import { getAllMeta } from "../services/metaService.js";
import { ok, fail } from "../utils/response.js";

export async function getMeta(req, res) {
  try {
    const meta = await getAllMeta();
    return res.json(ok(meta));
  } catch (err) {
    return res.json(fail("Failed to load metadata"));
  }

}
