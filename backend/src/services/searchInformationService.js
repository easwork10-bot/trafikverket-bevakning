// src/services/searchInformationService.js
import { trafikverketRequest } from "../automation/apiClient.js";

export async function getSearchInformation(userId, ssn, licenceId) {
  const body = {
    bookingSession: {
      socialSecurityNumber: ssn,
      licenceId,
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
    return { error: "Failed retrieving search-information" };
  }

  return result.data;
}
