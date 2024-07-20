const app = require("express")();
const { Client } = require("pg");

const client = new Client({
  user: "webserver",
  password: "highlysecurepassword",
  host: "localhost",
  port: 5432,
  database: "postgres",
});

client.connect();

app.post("/shorten", async (req, res) => {});

app.get("/goto", async (req, res) => {
  const shortUrl = req.query.short_url;
  if (!isShortURLValid(shortUrl)) {
    res.status(404).send("Sorry, your requested URL is incorrect.");
    return;
  }
  const { customName, id } = splitShortURL(shortUrl);
  const URLSelectorQuery = getURLSelectorQuery({ customName, id });
  console.log(URLSelectorQuery);
});

app.listen(3000, () => {
  console.log("Server setup on port 3000");
});

/**
 * Returns true if the input string is a single digit.
 * @param {string} c The character to check.
 */
function isDigit(c) {
  if (c.length !== 1) {
    return false;
  } else if (parseInt(c) >= 0 && parseInt(c) <= 9) {
    return true;
  } else {
    return false;
  }
}

/**
 * Validates a short URL.
 * @param {string} shortURL The short URL to validate.
 * @returns boolean - true if valid.
 */
function isShortURLValid(shortURL) {
  if (!shortURL || typeof shortURL !== typeof "string") {
    return false;
  }
  let underscoreFound = false;
  let idLengthFound = 0;
  let nameLengthFound = 0;
  let nonDigitIDCharFound = false;
  let i = shortURL.length - 1;
  while (i >= 0) {
    if (!underscoreFound) {
      if (shortURL[i] === "_") {
        underscoreFound = true;
      } else if (isDigit(shortURL[i])) {
        idLengthFound++;
      } else {
        nonDigitIDCharFound = true;
      }
    } else {
      nameLengthFound++;
    }
    i--;
  }
  if (nonDigitIDCharFound) {
    return false;
  } else if (!underscoreFound) {
    return false;
  } else if (idLengthFound > 19 || idLengthFound < 1) {
    return false; // id is a 64-bit number, so it can have 19 digits at most.
  } else if (nameLengthFound === 0) {
    return false; // Custom name is required.
  } else {
    return true;
  }
}

/**
 * Takes in a short URL and returns its 2 components - the custom name and the ID. Expects the short
 * URL to be valid.
 * @param {string} shortUrl The validated short url.
 */
function splitShortURL(shortUrl) {}

function getURLSelectorQuery({ customName, id }) {}
