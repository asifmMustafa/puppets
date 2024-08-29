import dotenv from "dotenv";
dotenv.config();

// Facebook accounts
const accounts = [
  {
    name: process.env.ACCOUNT_ONE_NAME as string,
    email: process.env.ACCOUNT_ONE_EMAIL as string,
    password: process.env.ACCOUNT_ONE_PASSWORD as string,
    proxy: process.env.PROXY_ONE as string,
  },
  {
    name: process.env.ACCOUNT_TWO_NAME as string,
    email: process.env.ACCOUNT_TWO_EMAIL as string,
    password: process.env.ACCOUNT_TWO_PASSWORD as string,
    proxy: process.env.PROXY_TWO as string,
  },
  {
    name: process.env.ACCOUNT_THREE_NAME as string,
    email: process.env.ACCOUNT_THREE_EMAIL as string,
    password: process.env.ACCOUNT_THREE_PASSWORD as string,
    proxy: process.env.PROXY_THREE as string,
  },
];

export default accounts;
