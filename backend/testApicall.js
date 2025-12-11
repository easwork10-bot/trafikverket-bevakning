import { trafikverketRequest } from "./src/automation/apiClient.js";

async function testSearchInformation() {
  const userId = 1; // den användare du loggade in som

  const body = {
    bookingSession: {
      socialSecurityNumber: "200209162536",   // ✨ byt mot ditt test-personnummer
      licenceId: 23,                          // t.ex B96 (kan vara 5 om B)
      bookingModeId: 0,
      ignoreDebt: false,
      ignoreBookingHindrance: false,
      examinationTypeId: 0,
      excludeExaminationCategories: [],
      rescheduleTypeId: 0,
      paymentIsActive: false,
      paymentReference: "",
      paymentUrl: "",
      searchedMonths: 0
    }
  };

  const result = await trafikverketRequest(
    userId,
    "search-information",
    body
  );

  console.log("RESULT FROM /search-information:");
  console.log(JSON.stringify(result, null, 2));
}

testSearchInformation();
