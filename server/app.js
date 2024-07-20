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
  const { customName, id } = splitShortURL(shortUrl);
  const URLSelectorQuery = getURLSelectorQuery({ customName, id });
  console.log(URLSelectorQuery);
});

app.listen(3000, () => {
  console.log("Server setup on port 3000");
});

function splitShortURL(shortUrl) {}

function getURLSelectorQuery({ customName, id }) {}
