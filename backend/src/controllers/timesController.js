// src/controllers/timesController.js
import { ok, fail } from "../utils/response.js";
import { getTimes } from "../services/timesService.js";

export async function getTimesController(req, res) {
  try {
    const { userId,ssn, licenceId, examTypeId, locationId } = req.body;

    if (!userId || !ssn || !licenceId || !examTypeId || !locationId) {
      return res.json(fail("Missing required fields"));
    }

    const times = await getTimes(
      userId,
      ssn,
      Number(licenceId),
      Number(examTypeId),
      Number(locationId)
    );

    return res.json(ok(times));
  } catch (err) {
    return res.json(fail("Times controller error: " + err.message));
  }
}
