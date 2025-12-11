// src/automation/login.js
import { chromium } from "playwright";
import { browserConfig } from "./playwright.config.js";
import { replaceAllCookies } from "../services/cookieStore.js";
import { log } from "../utils/logger.js";

export async function performLogin(userId) {
  const browser = await chromium.launch(browserConfig);
  const page = await browser.newPage();

  log.info(`Opening Trafikverket login page...`);
  await page.goto(`https://fp.trafikverket.se/Boka/ng/`);

  log.info("Waiting for user to log in manually...");
  await page.waitForURL("**/licence", { timeout: 0 });

  log.info(`User logged in. Waiting 3 seconds...`);
  await page.waitForTimeout(3000);

  const cookies = await page.context().cookies();

  log.info(`Saving all cookies for user: ${userId}`);
  await replaceAllCookies(userId, cookies);

  await browser.close();
  return true;
}
