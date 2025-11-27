import { chromium } from "playwright";
import { browserConfig } from "./playwright.config.js";
import { saveCookie } from "../services/cookieStore.js";
import { log } from "../utils/logger.js";

export async function startLoginSession(userId) {
  const browser = await chromium.launch(browserConfig);
  const page = await browser.newPage();

  log("Opening Trafikverket login page...");

  await page.goto("https://fp.trafikverket.se/Boka/ng/");

  log("Waiting for user to log in manually...");
  await page.waitForURL("**/licence",{ timeout: 0 }); 

  log("User logged in. Waiting 1 second extra...");
  await page.waitForTimeout(3000); //viktig extra delay

  const cookies = await page.context().cookies();

  log("Saving session cookie for user:", userId);
  await saveCookie(userId, cookies);

  await browser.close();

  return true;
}
