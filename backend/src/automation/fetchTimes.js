import { trafikverketRequest } from "./apiClient.js";

export async function fetchTimes(user) {
  const body = {
    bookingSession: {
      socialSecurityNumber: user.ssn,
      licenceId: user.licenceId,
      bookingModeId: 0,
      ignoreDebt: false,
      ignoreBookingHindrance: false,
      examinationTypeId: 52,
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
      locationId: user.cityId,
      nearbyLocationIds: [],
      languageId: 13,
      vehicleTypeId: 1,
      tachographTypeId: 1,
      occasionChoiceId: 1,
      examinationTypeId: 52
    }
  };

  return await trafikverketRequest(
    user.user_id,
    "occasion-bundles",
    body
  );
}
