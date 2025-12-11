import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from "./src/services/notifier.js";

async function test() {
  await sendEmail(
    "easalghiad@gmail.com",
    "Test från Trafikverket-bevakning",
    "<p>Mailfunktionen fungerar! 🚀</p>"
  );

  console.log("Email skickat!");
}

test();
