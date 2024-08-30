import { Page } from "puppeteer";
import { catchError, delay, getRandomNumber, logError, logMsg } from "./utils";
import { GhostCursor } from "ghost-cursor";
import accounts from "./data/accounts";
import { Account } from "./types";
import messages from "./data/messages";

const pickRandomFriend = (excludeName: string): string => {
  const filteredNames = accounts.filter(
    (account: Account) => account.name !== excludeName
  );

  return filteredNames[getRandomNumber(0, filteredNames.length - 1)].name;
};

export const type = async (
  page: Page,
  selector: string,
  text: string
): Promise<void> => {
  // Type the provided text into the specified input field, with each keystroke delayed by a random time between 50 to 150 milliseconds
  await page.type(selector, text, { delay: getRandomNumber(50, 150) });
};

export const clickLink = async (
  page: Page,
  cursor: GhostCursor,
  linkText: string
): Promise<void> => {
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
        catchError(err);
      }
    }
  }
};

export const scrollPage = async (page: Page): Promise<void> => {
  try {
    let reachedBottom = false;
    let reachedTop = false;

    let startTime;
    let scrollDuration;

    // Scroll down until the bottom of the page is reached
    while (!reachedBottom) {
      startTime = Date.now();
      scrollDuration = getRandomNumber(1500, 2500); // Random scrolling duration between 1.5 to 2.5 seconds

      // Scroll down for the specified duration
      while (!reachedBottom && Date.now() - startTime < scrollDuration) {
        const oldPosition = await page.evaluate(() => window.pageYOffset); // Get the current scroll position

        await page.mouse.wheel({ deltaY: 30 }); // Scroll down by 30 pixels
        await delay(50); // Wait for 50 milliseconds

        const newPosition = await page.evaluate(() => window.pageYOffset); // Get the new scroll position
        if (oldPosition === newPosition) {
          // If the scroll position hasn't changed, the bottom has been reached
          reachedBottom = true;
        }
      }

      // Wait for a random period between 2 to 3.5 seconds before potentially scrolling again
      await delay(getRandomNumber(2000, 3500));
    }

    // Randomly decide whether to scroll up after reaching the bottom
    if (getRandomNumber(0, 1)) {
      // Perform two scroll-up attempts
      for (let i = 0; i < 2; i++) {
        startTime = Date.now();
        scrollDuration = getRandomNumber(500, 1000); // Random scrolling duration between 0.5 to 1 second

        // Scroll up for the specified duration
        while (!reachedTop && Date.now() - startTime < scrollDuration) {
          const oldPosition = await page.evaluate(() => window.pageYOffset); // Get the current scroll position

          await page.mouse.wheel({ deltaY: -30 }); // Scroll up by 30 pixels
          await delay(50); // Wait for 50 milliseconds

          const newPosition = await page.evaluate(() => window.pageYOffset); // Get the new scroll position
          if (oldPosition === newPosition) {
            // If the scroll position hasn't changed, the top has been reached
            reachedTop = true;
          }
        }
      }
    }
  } catch (err) {
    catchError(err);
  } finally {
    // Ensure a final delay after scrolling completes, regardless of whether an error occurred
    await delay(getRandomNumber(1500, 2500));
  }
};

export const scrollToBottom = async (page: Page): Promise<void> => {
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
    catchError(err);
  }
};

const scrollToTop = async (page: Page): Promise<void> => {
  try {
    let reachedTop = false;

    while (!reachedTop) {
      let startTime = Date.now();
      let scrollDuration = getRandomNumber(1500, 2500);

      // Scroll up by small increments within the random duration window
      while (!reachedTop && Date.now() - startTime < scrollDuration) {
        const oldPosition = await page.evaluate(() => window.pageYOffset);

        await page.mouse.wheel({ deltaY: -30 });
        await delay(50);

        const newPosition = await page.evaluate(() => window.pageYOffset);

        // If the scroll position hasn't changed, the top has been reached
        if (oldPosition === newPosition) {
          reachedTop = true;
        }
      }

      // Wait for a random period between 1 to 2 seconds before potentially scrolling again
      await delay(getRandomNumber(1000, 2000));
    }
  } catch (err) {
    catchError(err);
  }
};

const textFriend = async (
  page: Page,
  cursor: GhostCursor,
  user: string
): Promise<void> => {
  // Click on the "Messages" link to navigate to the messages page
  await clickLink(page, cursor, "Messages");
  await delay(getRandomNumber(1500, 2500));

  const friend = pickRandomFriend(user);

  // Click on the randomly selected friend's name in the messages list
  await clickLink(page, cursor, pickRandomFriend(user));

  logMsg("yellow", "TEXTING", `${user} texting ${friend}`);
  await delay(getRandomNumber(1500, 2500));

  // Determine the number of messages to send (0 to 3)
  let num_of_texts = getRandomNumber(0, 3);

  for (let i = 0; i <= num_of_texts; i++) {
    // Move the cursor to the message input field
    await cursor.move("#composerInput");
    await page.focus("#composerInput");

    // Type a random message from the predefined list of messages
    await type(
      page,
      "#composerInput",
      messages[getRandomNumber(0, messages.length - 1)]
    );

    // Move the cursor to the send button and click
    await cursor.move('[name="send"]');
    await page.click('[name="send"]');

    // Wait for a random delay before sending the next message
    await delay(getRandomNumber(1500, 2500));
  }
};

export const beHuman = async (
  page: Page,
  cursor: GhostCursor,
  user: string
): Promise<void> => {
  // Determine whether the user should text a friend during this session
  const shouldText = Math.random() < 0.5;

  // Determine whether the user should text a friend before scrolling the feed
  const shouldTextFirst = Math.random() < 0.5;

  if (shouldText && shouldTextFirst) {
    // Scroll to the top of the page before starting the texting process
    await scrollToTop(page);

    try {
      // Attempt to text a friend
      await textFriend(page, cursor, user);
    } catch (err) {
      // If an error occurs during the texting process, retry texting the friend
      await textFriend(page, cursor, user);
    }

    // After texting, click on the "Home" link to navigate to the home page
    await clickLink(page, cursor, "Home");
    await delay(getRandomNumber(1500, 2500));

    logMsg("yellow", "SCROLLING", `${user} scrolling feed`);

    // Scroll through the feed
    await scrollPage(page);
  } else {
    // If the user should scroll the feed first, click on the "Home" link
    await clickLink(page, cursor, "Home");
    await delay(getRandomNumber(1500, 2500));

    logMsg("yellow", "SCROLLING", `${user} scrolling feed`);

    // Scroll through the feed
    await scrollPage(page);

    if (shouldText) {
      await scrollToTop(page);

      try {
        await textFriend(page, cursor, user);
      } catch (err) {
        await textFriend(page, cursor, user);
      }
    }
  }
};
