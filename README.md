# Puppets

Scrape facebook using dummy accounts or what I like to call 'puppets'

Create one or multiple dummy accounts on facebook. These puppets then scrape the pages you add in src/data/sources.ts and at random times behaves like a human to throw off facebook's bot detection. They randomly scroll through their news feed, scroll through the pages they are scraping, send each other text messages and even randomly logs out to rest.
When interacting with the pages the cursor movements are randomized using the ghost-cursor package. Each account uses different proxies so you need to find a proxy provider, I used https://oxylabs.io/

You should put your custom scraping logic in src/scrape.ts

Made using puppeteer which clearly inspired the name :)

[Demo video](https://streamable.com/zj2ouh)

## Installation

Clone the repository

```bash
git clone https://github.com/asifmMustafa/puppets.git
```

Install the packages

```bash
cd puppets
npm install
```

Create a .env file in the root directory and add the following:

```env
PROXY_ONE=
PROXY_TWO=

ACCOUNT_ONE_NAME=
ACCOUNT_ONE_EMAIL=
ACCOUNT_ONE_PASSWORD=

ACCOUNT_TWO_NAME=
ACCOUNT_TWO_EMAIL=
ACCOUNT_TWO_PASSWORD=

# add more accounts and proxies as needed
```

Start the script

```bash
npm start
```
