import dotenv from "dotenv";
dotenv.config();
import { trafikverketRequest } from "./src/automation/apiClient.js";
import { sendEmail } from "./src/services/notifier.js";

async function testWatcher() {
  const testUser = {
    user_id: 1,           // samma du loggade in med
    ssn: "200209162536",
    licenceid: 23,        // B96
    cityid: 1000118,      // Gävle
    email: "easaglhiad@gmail.com"
  };

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
    testUser.user_id,
    "occasion-bundles",
    body
  );

  if (!result?.data?.bundles) {
    console.log("No bundles, no email sent.");
    return;
  }

  // Flatten times
  const occasions = result.data.bundles
    .flatMap(b => b.occasions)
    .map(o => `${o.date} ${o.time} – ${o.locationName}`)
    .join("<br>");

  console.log("Found occasions:");
  console.log(occasions);

  await sendEmail(
    testUser.email,
    "TEST – Lediga tider",
    `<p>Dessa tider hittades:</p><p>${occasions}</p>`
  );

  console.log("Test email sent.");
}

testWatcher();
