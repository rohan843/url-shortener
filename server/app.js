const app = require("express")();
const { Client } = require("pg");

// HACK: Start the container before beginning the work.
const client = new Client({
  user: "webserver",
  password: "highlysecurepassword",
  host: "localhost",
  port: 5432,
  database: "webserver",
});

client.connect();

// TODO: Complete this endpoint.
app.post("/shorten", async (req, res) => {});

// TODO: Implement error handling.
app.get("/goto", async (req, res) => {
  const shortUrl = req.query.short_url;
  if (!isShortURLValid(shortUrl)) {
    res.status(404).send("Sorry, your requested URL is incorrect.");
    return;
  }
  const { customName, id } = splitShortURL(shortUrl);
  const URLSelectorQuery =
    "SELECT url_string, permanent, expiry_date FROM url_table WHERE id = $1 and custom_name = $2";
  const values = [id, customName];
  const result = await client.query(URLSelectorQuery, values);
  if (result.rowCount === 0) {
    res.status(404).send("URL not found");
  } else {
    const { url_string, permanent, expiry_date } = result.rows[0];
    if (permanent) {
      res.send(url_string);
    } else if (new Date(expiry_date) >= new Date()) {
      res.send(url_string);
    } else {
      res.status(410).send("This link has expired.");
    }
  }
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
function splitShortURL(shortUrl) {
  const sep = shortUrl.lastIndexOf("_");
  const id = shortUrl.substring(sep + 1);
  const customName = shortUrl.substring(0, sep);
  return { customName, id };
}
