import { Page } from "puppeteer";

export const scrape = async (page: Page) => {
  await page.waitForSelector("#contact-info");

  const websiteLink = await page.$eval("#contact-info a", (element) =>
    element.textContent?.trim()
  );

  await page.waitForSelector("#bio");

  const aboutText = await page.$eval("#bio .dj.dk.dl", (element) =>
    element.textContent?.trim()
  );

  console.log("\n\nWebsite link:", websiteLink);
  console.log("\n\nAbout:", aboutText);
  console.log("\n\n");
};
