import puppeteer, { Browser } from "puppeteer";
import { createCursor, installMouseHelper } from "ghost-cursor";
import { logMsg, logError, getRandomNumber } from "./utils";
import accounts from "./data/accounts";
import { Account, AccountState } from "./types";

const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MIN_ACTIVE_TIME = 7200000; // 2 hours
const MAX_ACTIVE_TIME = 14400000; // 4 hours
const MIN_DOWN_TIME = 7200000;
const MAX_DOWN_TIME = 14400000;

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
    this.managers = accounts.map(
      (account: Account) => new AccountManager(account)
    );
  }

  ensureMinimumActive() {
    const activeCount = this.managers.filter(
      (manager) => manager.state === AccountState.ACTIVE
    ).length;

    if (activeCount === 0) {
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

  startAll() {
    this.managers.forEach((manager) => manager.start());
    setInterval(() => this.ensureMinimumActive(), 10000); // Check every minute to maintain at least one active account
  }
}

const startSession = async (
  browser: Browser,
  account: Account,
  activeDuration: number
): Promise<void> => {
  // i will add logic here later
};

const main = async () => {
  const scheduler = new Scheduler(accounts);
  scheduler.startAll();
};

main();
