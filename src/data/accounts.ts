require("dotenv").config();

// Facebook accounts
const accounts = [
  {
    name: process.env.ACCOUNT_ONE_NAME,
    email: process.env.ACCOUNT_ONE_EMAIL,
    password: process.env.ACCOUNT_ONE_PASSWORD,
    proxy: process.env.PROXY_ONE,
  },
  {
    name: process.env.ACCOUNT_TWO_NAME,
    email: process.env.ACCOUNT_TWO_EMAIL,
    password: process.env.ACCOUNT_TWO_PASSWORD,
    proxy: process.env.PROXY_TWO,
  },
  {
    name: process.env.ACCOUNT_THREE_NAME,
    email: process.env.ACCOUNT_THREE_EMAIL,
    password: process.env.ACCOUNT_THREE_PASSWORD,
    proxy: process.env.PROXY_THREE,
  },
];

module.exports = accounts;
