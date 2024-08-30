export enum AccountState {
  ACTIVE = "ACTIVE",
  REST = "REST",
}

type Account = {
  name: string;
  email: string;
  password: string;
  proxy: string;
};

type Source = {
  url: string;
  name: string;
  being_scraped: boolean;
};

export { Account, Source };
