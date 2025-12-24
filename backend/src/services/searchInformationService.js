import { trafikverketRequest } from "../automation/apiClient.js";
import { saveMetadata } from "./metadataWriter.js";
import { log } from "../utils/logger.js";

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

  // 🔽 EXTRACT REAL LOCATIONS
  const rawLocations = Array.isArray(result.data.locations)
    ? result.data.locations.map(l => l.location)
    : [];

  try {
    await saveMetadata({
      licences: result.data.licences,
      examTypes: result.data.examinationTypes,
      locations: rawLocations
    });

    log.info(`[META] Saved metadata from search-information (locations: ${rawLocations.length})`);
  } catch (err) {
    log.warn("[META] Failed to save metadata:", err.message);
  }

  return result.data;
}
