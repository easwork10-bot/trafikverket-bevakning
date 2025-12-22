// src/controllers/trafficController.js
import { ok, fail } from "../utils/response.js";
import { trafikverketRequest } from "../automation/apiClient.js";

export async function getSearchInformation(req, res) {
  try {
    const {userId, ssn, licenceId } = req.body;
    if (!userId) {
      return res.json(fail("Missing userId"));
    }
    if (!ssn || !licenceId) {
      return res.json(fail("Missing ssn or licenceId"));
    }

    const body = {
      bookingSession: {
        socialSecurityNumber: ssn,
        licenceId: Number(licenceId),
        bookingModeId: 0,
        ignoreDebt: false,
        ignoreBookingHindrance: false,
        examinationTypeId: 0
      }
    };

    const result = await trafikverketRequest(
      userId,
      "search-information",
      body
    );

    if (!result?.data) {
      return res.json(fail("Failed retrieving search-information"));
    }

    return res.json(ok(result.data));
  } catch (err) {
    return res.json(fail("Controller error: " + err.message));
  }
}
