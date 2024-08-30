import puppeteer, { Browser, Page } from "puppeteer";
import { createCursor, GhostCursor, installMouseHelper } from "ghost-cursor";
import { logMsg, logError, getRandomNumber, delay, catchError } from "./utils";
import accounts from "./data/accounts";
import { Account, AccountState, Source } from "./types";
import { beHuman, clickLink, scrollPage, scrollToBottom, type } from "./human";
import sources from "./data/sources";
import { scrape } from "./scrape";

const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MIN_ACTIVE_TIME = 7200000; // 2 hours
const MAX_ACTIVE_TIME = 14400000; // 4 hours
const MIN_DOWN_TIME = 7200000;
const MAX_DOWN_TIME = 14400000;

let CURR_SCRAPING_CYCLE: Source[] = [];

class AccountManager {
  private account: Account;
  public state: AccountState;
  private restStartTime: number;
  private browser: Browser | null;
  private activeDuration: number;
  public allowedRestDuration: number;

  constructor(account: Account) {
    this.account = account;
    this.state = AccountState.REST;
    this.restStartTime = Date.now();
    this.browser = null;
    this.activeDuration = getRandomNumber(MIN_ACTIVE_TIME, MAX_ACTIVE_TIME);
    this.allowedRestDuration = getRandomNumber(MIN_DOWN_TIME, MAX_DOWN_TIME);
  }

  async start(): Promise<void> {
    // an account can only start running again if it is in rest
    if (this.state !== AccountState.REST) {
      logError(`${this.account.name} is not in rest and cannot start.`);
      return;
    }

    logMsg("green", "STARTING", `Account: ${this.account.name}`);

    this.state = AccountState.ACTIVE;
    this.activeDuration = getRandomNumber(MIN_ACTIVE_TIME, MAX_ACTIVE_TIME);

    this.browser = await puppeteer.launch({
      headless: false,
      args: [`--proxy-server=${this.account.proxy}`],
    });

    this.handleActiveSession().catch((error: Error) => {
      logError(`${this.account.name} encountered an error: ${error.message}`);
      this.resetState();
    });
  }

  private async handleActiveSession(): Promise<void> {
    // start scraping session
    await startSession(
      this.browser as Browser,
      this.account,
      this.activeDuration
    );

    // logout after done scraping
    logMsg("yellow", "LOGOUT", `Account: ${this.account.name}`);
    this.resetState();
  }

  private async resetState(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
    this.browser = null;
    this.state = AccountState.REST;
    this.allowedRestDuration = getRandomNumber(MIN_DOWN_TIME, MAX_DOWN_TIME);
    this.restStartTime = Date.now();
  }

  getRestDuration(): number {
    if (this.state === AccountState.REST) {
      return Date.now() - this.restStartTime;
    }
    return -1;
  }
}

class Scheduler {
  private managers: AccountManager[];

  constructor(accounts: Account[]) {
    // Initialize AccountManager instances for each account
    this.managers = accounts.map(
      (account: Account) => new AccountManager(account)
    );
  }

  ensureMinimumActive() {
    // Check how many accounts are currently active
    const activeCount = this.managers.filter(
      (manager) => manager.state === AccountState.ACTIVE
    ).length;

    if (activeCount === 0) {
      // If no accounts are active, start the one with the longest rest duration
      const longestRestManager = this.managers.reduce<AccountManager | null>(
        (longest, current) => {
          if (
            longest === null ||
            current.getRestDuration() > longest.getRestDuration()
          ) {
            return current;
          }
          return longest;
        },
        null
      );

      if (longestRestManager) {
        longestRestManager.start();
      }
    } else {
      // Start accounts that have finished their allowed rest duration
      this.managers.forEach((manager) => {
        if (manager.state === AccountState.REST) {
          const currentRestDuration = manager.getRestDuration();
          if (currentRestDuration >= manager.allowedRestDuration) {
            manager.start();
          }
        }
      });
    }
  }

  // Start all accounts and maintain at least one active account
  startAll() {
    this.managers.forEach((manager) => manager.start());
    setInterval(() => this.ensureMinimumActive(), 10000); // Check every minute to maintain at least one active account
  }
}

const login = async (
  page: Page,
  cursor: GhostCursor,
  account: Account
): Promise<void> => {
  await page.goto("https://mbasic.facebook.com", {
    waitUntil: "networkidle0",
  });

  await delay(5000);

  try {
    // Scroll to the bottom and accept essential cookies if the prompt appears
    await scrollToBottom(page);
    await cursor.move('button[name="accept_only_essential"]');
    await page.click('button[name="accept_only_essential"]');
  } catch (err) {
    logError("No cookies page!");
  }

  await type(page, "#m_login_email", account.email);
  await type(page, '[name="pass"]', account.password);
  await cursor.move('[name="login"]');
  await page.click('[name="login"]');

  await clickLink(page, cursor, "Not Now");

  await delay(3000);
};

const startSession = async (
  browser: Browser,
  account: Account,
  activeDuration: number
): Promise<void> => {
  const startTime = Date.now();

  const page = await browser.newPage();
  await page.setUserAgent(CUSTOM_USER_AGENT);

  // create a cursor and install mouse helper for visibility
  const cursor = createCursor(page);
  installMouseHelper(page);

  await login(page, cursor, account);

  // scroll the news feed
  await scrollPage(page);

  // scrape a random number of sources before mimicing human behavior
  let num_to_scrape_before_mimic = getRandomNumber(2, 6);
  let scraped = 0;

  while (Date.now() - startTime < activeDuration) {
    CURR_SCRAPING_CYCLE = [];
    for (let source of sources) {
      if (!source.being_scraped && !CURR_SCRAPING_CYCLE.includes(source)) {
        source.being_scraped = true;
        logMsg(
          "green",
          "PROCESSING",
          `${account.name} scraping ${source.name}`
        );

        try {
          // Navigate to the source URL, scroll the page, and scrape required content
          await page.goto(source.url, { waitUntil: "networkidle0" });
          await scrollPage(page);
          await scrape(page);
          scraped++;
          CURR_SCRAPING_CYCLE.push(source);
        } catch (err) {
          catchError(err);
        }
        source.being_scraped = false;

        if (CURR_SCRAPING_CYCLE.length === sources.length) {
          logMsg("green", "CYCLE COMPLETE", "");
          CURR_SCRAPING_CYCLE = [];
        }

        await delay(getRandomNumber(1500, 2500));

        // After scraping a few sources, mimic human behavior
        if (scraped === num_to_scrape_before_mimic) {
          num_to_scrape_before_mimic = getRandomNumber(2, 4);
          scraped = 0;
          try {
            await beHuman(page, cursor, account.name);
          } catch (err) {
            catchError(err);
          }
        }
      }
    }
  }
};

const main = async () => {
  const scheduler = new Scheduler(accounts);
  scheduler.startAll();
};

main();
