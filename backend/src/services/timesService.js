// src/services/timesService.js
import { trafikverketRequest } from "../automation/apiClient.js";
import { log } from "../utils/logger.js";

/**
 * Hämta ALLA tider via occasion-bundles
 */
export async function getTimes(userId, ssn, licenceId, examTypeId, locationId) {
  log.info(`[TIMES] Fetching times for user=${userId} ssn=${ssn} lic=${licenceId} exam=${examTypeId} city=${locationId}`);

  const body = {
    bookingSession: {
      socialSecurityNumber: ssn,
      licenceId,
      bookingModeId: 0,
      ignoreDebt: false,
      ignoreBookingHindrance: false,
      examinationTypeId: examTypeId,
      excludeExaminationCategories: [],
      rescheduleTypeId: 0,
      paymentIsActive: false,
      paymentReference: "",
      paymentUrl: "",
      searchedMonths: 0
    },
    occasionBundleQuery: {
      startDate: new Date().toISOString(),
      searchedMonths: 0,
      locationId,
      nearbyLocationIds: [],
      languageId: 13,
      vehicleTypeId: 1,
      tachographTypeId: 1,
      occasionChoiceId: 1,
      examinationTypeId: examTypeId
    }
  };

  const res = await trafikverketRequest(userId, "occasion-bundles", body);

  log.debug(`[TIMES] Raw bundles: ${JSON.stringify(res?.data?.bundles || "NO_BUNDLES")}`);

  if (!res?.data?.bundles) {
    log.warn("[TIMES] No bundles in response");
    return [];
  }

  const mapped = res.data.bundles.flatMap(b =>
    b.occasions?.map(o => ({
      start: o.duration.start,
      end: o.duration.end,
      locationId,
      examName: o.name ?? null,
      bundleId: b.id
    })) || []
  );

  log.info(`[TIMES] Found ${mapped.length} times`);
  return mapped;
}

/**
 * Hämta tider för EXAKT datum (occasion-search)
 */
export async function searchTimesByDate(userId, ssn, licenceId, examTypeId, locationId, date) {
  log.info(`[TIMES] Searching ${date} at ${locationId}`);

  const body = {
    date,
    locationId,
    examTypeId,
    vehicleTypeId: 1
  };

  const res = await trafikverketRequest(userId, "occasion-search", body);
  if (!res?.data?.occasions) return [];

  return res.data.occasions.map(o => ({
    start: o.duration.start,
    end: o.duration.end,
    examName: o.name ?? null,
    locationId
  }));
}

/**
 * Hämta suggested times
 */
export async function getSuggestedTimes(userId, ssn, licenceId, examTypeId, locationId) {
  log.info(`[TIMES] Fetching suggested times for ${locationId}`);

  const body = {
    bookingSession: {
      socialSecurityNumber: ssn,
      licenceId,
      bookingModeId: 0,
      examinationTypeId: examTypeId
    },
    occasionBundleQuery: {
      locationId,
      searchedMonths: 0,
      nearbyLocationIds: [],
      languageId: 13,
      vehicleTypeId: 1,
      tachographTypeId: 1
    }
  };

  const res = await trafikverketRequest(userId, "suggested-times", body);
  if (!res?.data?.suggestions) return [];

  return res.data.suggestions.map(s => ({
    date: s.date,
    earliest: s.earliest,
    latest: s.latest,
    count: s.count
  }));
}
