const app = require("express")();
const { Client } = require("pg");
const path = require("path");

const serverURL = "http://localhost:3000";

// HACK: Start the container before beginning the work.
const client = new Client({
  user: "webserver",
  password: "highlysecurepassword",
  host: "localhost",
  port: 5432,
  database: "webserver",
});

client.connect();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

// TODO: Implement error handling.
app.post("/shorten", async (req, res) => {
  const url = req.query.url;
  const permanent = req.query.permanent;
  const expiry_date = req.query.expiry_date;
  const custom_name = req.query.custom_name;
  if (!validInputs({ url, permanent, expiry_date, custom_name })) {
    res.json({
      error: "Invalid arguments passed.",
      shortUrl: null,
    });
  } else {
    const result = await client.query(
      "insert into url_table (url_string, permanent, expiry_date, custom_name) values ($1, $2, to_timestamp($3), $4) returning id;",
      [
        url,
        permanent === "t",
        new Date(expiry_date).getTime() / 1000 || 0,
        custom_name,
      ]
    );
    const { id } = result.rows[0];
    const shortURL = custom_name + "_" + id;

    res.json({
      error: "Success!",
      shortURL: `${serverURL}/goto?short_url=${shortURL}`,
    });
  }
});

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
 * Validates the parameters used for creating a short URL.
 * @returns `true` if params are correct, else `false`.
 */
function validInputs({ permanent, expiry_date, custom_name, url }) {
  if (permanent !== "t" && permanent !== "f") {
    return false;
  } else if (!custom_name || /\s/.test(custom_name)) {
    return false; // custom name should not be empty, and should not have any whitespaces.
  } else if (permanent === "f" && isNaN(new Date(expiry_date).getTime())) {
    return false;
  } else if (!url) {
    return false;
  } else {
    return true;
  }
}

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
