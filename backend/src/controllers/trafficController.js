import { ok, fail } from "../utils/response.js";
import { getSearchInformation as getSearchInformationService } from "../services/searchInformationService.js";

export async function getSearchInformation(req, res) {
  try {
    const { userId, ssn, licenceId } = req.body;

    if (!userId) {
      return res.json(fail("Missing userId"));
    }

    if (!ssn || !licenceId) {
      return res.json(fail("Missing ssn or licenceId"));
    }

    const data = await getSearchInformationService(
      userId,
      ssn,
      Number(licenceId)
    );

    if (data?.error) {
      return res.json(fail(data.error));
    }

    return res.json(ok(data));
  } catch (err) {
    return res.json(fail("Controller error: " + err.message));
  }
}
