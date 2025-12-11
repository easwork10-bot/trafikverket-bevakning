import { trafikverketRequest } from "./src/automation/apiClient.js";

async function testOccasions() {
  const userId = 1;

  const body = {
    bookingSession: {
      socialSecurityNumber: "200209162536", // samma som login
      licenceId: 23,                // B96
      bookingModeId: 0,
      ignoreDebt: false,
      ignoreBookingHindrance: false,
      examinationTypeId: 52,        // körprov
      excludeExaminationCategories: [],
      rescheduleTypeId: 0,
      paymentIsActive: false,
      searchedMonths: 0
    },
    occasionBundleQuery: {
      startDate: new Date().toISOString(),
      searchedMonths: 0,
      locationId: 1000118,          // Gävle
      nearbyLocationIds: [],
      languageId: 13,
      vehicleTypeId: 1,
      tachographTypeId: 1,
      occasionChoiceId: 1,
      examinationTypeId: 52
    }
  };

  const result = await trafikverketRequest(
    userId,
    "occasion-bundles",
    body
  );

  console.log("RESULT FROM occasion-bundles:");
  console.log(JSON.stringify(result, null, 2));
}

testOccasions();
