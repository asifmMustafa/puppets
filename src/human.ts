import { Page } from "puppeteer";
import { delay, getRandomNumber, logError } from "./utils";
import { GhostCursor } from "ghost-cursor";

export const type = async (page: Page, selector: string, text: string) => {
  // Type the provided text into the specified input field, with each keystroke delayed by a random time between 50 to 150 milliseconds
  await page.type(selector, text, { delay: getRandomNumber(50, 150) });
};

export const clickLink = async (
  page: Page,
  cursor: GhostCursor,
  linkText: string
) => {
  const elements = await page.$$("a");
  if (elements.length !== 0) {
    for (const elem of elements) {
      try {
        const targetLink = await elem.evaluate((node) => node.innerText);

        // If the link text matches the desired link, move the cursor to it and click
        if (targetLink.includes(linkText)) {
          await cursor.move(elem);
          await cursor.click();
          break;
        }
      } catch (err) {
        if (err instanceof Error) {
          logError(err.message);
        } else {
          logError("An unknown error occurred.");
        }
      }
    }
  }
};

export const scrollToBottom = async (page: Page) => {
  try {
    let reachedBottom = false;

    while (!reachedBottom) {
      let startTime = Date.now();
      let scrollDuration = getRandomNumber(1500, 2500);

      // Scroll down by small increments within the random duration window
      while (!reachedBottom && Date.now() - startTime < scrollDuration) {
        const oldPosition = await page.evaluate(() => window.pageYOffset);

        await page.mouse.wheel({ deltaY: +30 });
        await delay(50);

        const newPosition = await page.evaluate(() => window.pageYOffset);

        // If the scroll position hasn't changed, the bottom has been reached
        if (oldPosition === newPosition) {
          reachedBottom = true;
        }
      }

      // Wait for a random period between 1 to 2 seconds before potentially scrolling again
      await delay(getRandomNumber(1000, 2000));
    }
  } catch (err) {
    if (err instanceof Error) {
      logError(err.message);
    } else {
      logError("An unknown error occurred.");
    }
  }
};
