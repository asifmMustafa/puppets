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

export { Account };
