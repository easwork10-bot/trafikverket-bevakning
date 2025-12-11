import { trafikverketRequest } from "./src/automation/apiClient.js";

async function testSuggested() {
  const userId = 1; 

  const body = {
    bookingSession: {
      socialSecurityNumber: "200209162536", // byt till ditt riktiga
      licenceId: 23, 
      bookingModeId: 0,
      ignoreDebt: false,
      ignoreBookingHindrance: false,
      examinationTypeId: 52,
      excludeExaminationCategories: [],
      rescheduleTypeId: 0,
      paymentIsActive: false,
      searchedMonths: 0
    }
  };

  const result = await trafikverketRequest(
    userId,
    "get-suggested-reservations-by-licence-and-ssn",
    body
  );

  console.log("RESULT FROM suggested:");
  console.log(JSON.stringify(result, null, 2));
}

testSuggested();
